import asyncio
import inspect
import json
import logging
from typing import Any, Callable, Dict, Optional
from pathlib import Path

import aiohttp
import pdfplumber
from docx import Document
from langchain.schema import HumanMessage, SystemMessage
from langchain.agents import Tool, initialize_agent, AgentType
from langchain_openai import ChatOpenAI
from sqlalchemy.orm import Session
from database.db import get_db, engine, Base
from database.models import Chat, Message
from prompt import SYSTEM_PROMPT

Base.metadata.create_all(bind=engine)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

DEFAULT_SESSION = "default_session"
session_store: Dict[str, Dict[str, Any]] = {}

RESUME_TOOLS = ["personal_info", "summary", "experience", "education", "skills", "projects", "achievements"]
MCP_HOST = "http://localhost:8000/mcp/tools"


async def call_mcp_tool(tool_name: str, input_data: str, session_id: str) -> str:
    url = f"{MCP_HOST}/{tool_name}"
    payload = {"query": input_data, "session_id": session_id}
    logger.info(f"[MCP CALL] {tool_name} | Session: {session_id} | Input: {input_data[:100]}...")
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as resp:
                res = await resp.json()
                if "result" in res:
                    logger.info(
                        f"[MCP RESPONSE] {tool_name} | Session: {session_id} | Output: {str(res['result'])[:100]}...")
                    return res["result"]
                else:
                    logger.error(f"[MCP ERROR] {tool_name} | Session: {session_id} | Error: {res.get('error')}")
                    return f"[tool_error] {res.get('error', 'Unknown error')}"
    except Exception as e:
        logger.exception(f"[MCP EXCEPTION] {tool_name} | Session: {session_id} | Error: {e}")
        return f"[tool_error] {str(e)}"


async def _tool_async(tool_name: str, query: str, session_id: str):
    return await call_mcp_tool(tool_name, query, session_id)


def bridge_for(tool_name: str) -> Callable[[Any, Optional[str]], Any]:
    def sync_or_awaitable(input_data, session_id: Optional[str] = None):
        sid = session_id or DEFAULT_SESSION
        coro = _tool_async(tool_name, input_data, sid)
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None
        if loop and loop.is_running():
            return asyncio.create_task(coro)

        import concurrent.futures

        def _run_in_new_loop(c):
            new_loop = asyncio.new_event_loop()
            try:
                asyncio.set_event_loop(new_loop)
                return new_loop.run_until_complete(c)
            finally:
                new_loop.close()

        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
            fut = ex.submit(_run_in_new_loop, coro)
            return fut.result()

    return sync_or_awaitable


personal_info_bridge = bridge_for("personal_info")
summary_bridge = bridge_for("summary")
experience_bridge = bridge_for("experience")
education_bridge = bridge_for("education")
skills_bridge = bridge_for("skills")
projects_bridge = bridge_for("projects")
achievements_bridge = bridge_for("achievements")

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
tools = [
    Tool(name="personal_info", func=personal_info_bridge, description="Extract personal info from text"),
    Tool(name="summary", func=summary_bridge, description="Generate a professional summary"),
    Tool(name="experience", func=experience_bridge, description="Extract work experience"),
    Tool(name="education", func=education_bridge, description="Extract education details"),
    Tool(name="skills", func=skills_bridge, description="Extract skills from text"),
    Tool(name="projects", func=projects_bridge, description="Extract project details"),
    Tool(name="achievements", func=achievements_bridge, description="Extract achievements"),
]
RESUME_AGENT = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)


async def fallback_handler(query: str, session_id: str, llm_model) -> str:
    query_clean = query.strip()
    if not query_clean:
        return "Please type something related to your resume."
    messages = [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=query_clean)]
    response = await llm_model.agenerate([messages])
    return response.generations[0][0].text


async def decide_action_with_llm(user_message: str, session_id: str, llm_model) -> Dict[str, Any]:
    messages = [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=user_message)]
    try:
        response = await llm_model.agenerate([messages])
        raw = response.generations[0][0].text.strip()
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict) and 'action' in parsed:
                return parsed
        except json.JSONDecodeError:
            start = raw.find('{')
            end = raw.rfind('}')
            if start != -1 and end != -1 and end > start:
                try:
                    parsed = json.loads(raw[start:end + 1])
                    if isinstance(parsed, dict) and 'action' in parsed:
                        return parsed
                except Exception:
                    pass
    except Exception as e:
        logger.exception("Error while calling decision LLm: %s", str(e))
    return {"action": "fallback", "response": await fallback_handler(user_message, session_id, llm_model)}


def determine_tool_from_query(query: str) -> Optional[str]:
    q = query.lower()
    if any(x in q for x in ["name", "phone", "email", "contact"]):
        return "personal_info"
    if any(x in q for x in ["summary", "career objective", "about me"]):
        return "summary"
    if any(x in q for x in ["experience", "worked", "company", "job"]):
        return "experience"
    if any(x in q for x in ["education", "degree", "university", "school"]):
        return "education"
    if any(x in q for x in ["skill", "technology", "tools"]):
        return "skills"
    if any(x in q for x in ["project", "application", "app"]):
        return "projects"
    if any(x in q for x in ["achievement", "award", "certification", "cert"]):
        return "achievements"
    return None


class Runner:
    @staticmethod
    async def run(agent, query: str, context: Optional[Dict] = None, db: Optional[Session] = None):
        if db is None:
            db_gen = get_db()
            db = next(db_gen)
        session_id = context.get("session_id", DEFAULT_SESSION) if context else DEFAULT_SESSION
        if session_id not in session_store:
            session_store[session_id] = {
                tool: [] if tool in ["experience", "education", "skills", "projects", "achievements"] else None
                for tool in RESUME_TOOLS
            }
        session_data = session_store[session_id]

        chat = db.query(Chat).filter(Chat.session_id == session_id).first()
        if not chat:
            chat = Chat(session_id=session_id)
            db.add(chat)
            db.commit()
            db.refresh(chat)

        user_msg = Message(chat_id=chat.id, role="user", content=query)
        db.add(user_msg)
        db.commit()

        uploaded_files = [msg.content.replace("[Attachment]", "").strip()
                          for msg in chat.messages if msg.content.startswith("[Attachment]")]
        file_text = ""
        if len(uploaded_files) == 1:
            filename = uploaded_files[0]
            file_path = Path("uploads") / filename
            if file_path.exists():
                if file_path.suffix.lower() == ".pdf":
                    with pdfplumber.open(file_path) as pdf:
                        file_text = "\n".join([p.extract_text() or "" for p in pdf.pages])
                elif file_path.suffix.lower() == ".docx":
                    doc = Document(file_path)
                    file_text = "\n".join([p.text for p in doc.paragraphs])
                else:
                    file_text = f"[Cannot parse this file type: {file_path.suffix}]"
            query_with_file = f"{query}\n\n[File Content from {filename}]:\n{file_text}"
        else:
            query_with_file = query

        decision = await decide_action_with_llm(query_with_file, session_id, llm)
        action = decision.get("action")
        if not action:
            selected_tool = determine_tool_from_query(query)
            if selected_tool:
                decision = {"action": "use_tool", "tool": selected_tool, "tool_input": query, "call_immediately": True}
                action = "use_tool"
            else:
                action = "fallback"
                decision = {"action": "fallback", "response": await fallback_handler(query_with_file, session_id, llm)}

        if action == "update_section":
            section = decision.get("section")
            content = decision.get("content", "")
            if section in session_data:
                if section in ["experience", "education", "skills", "projects", "achievements"]:
                    session_data[section].append(content)
                else:
                    session_data[section] = content
                logger.info(
                    f"[UPDATE_SECTION] Session: {session_id} | Section: {section} | Content: {content[:100]}...")

                final_resume = ""
                for tool_name in RESUME_TOOLS:
                    section_input = session_data.get(tool_name)
                    if not section_input or (isinstance(section_input, list) and len(section_input) == 0):
                        continue
                    if isinstance(section_input, list):
                        for item in section_input:
                            final_resume += await call_mcp_tool(tool_name, item, session_id) + "\n\n"
                    else:
                        final_resume += await call_mcp_tool(tool_name, section_input, session_id) + "\n\n"

                assistant_msg = Message(chat_id=chat.id, role="assistant", content=final_resume.strip())
                db.add(assistant_msg)
                db.commit()
                return {"final_output": final_resume.strip()}

        if action == "use_tool":
            tool_name = decision.get("tool")
            tool_input = decision.get("tool_input", query)
            if tool_name not in RESUME_TOOLS:
                tool_name = determine_tool_from_query(query)
            if not tool_name:
                resp = await fallback_handler(query_with_file, session_id, llm)
                assistant_msg = Message(chat_id=chat.id, role="assistant", content=resp)
                db.add(assistant_msg)
                db.commit()
                return {"final_output": resp}

            if tool_name in ["experience", "education", "skills", "projects", "achievements"]:
                session_data[tool_name].append(tool_input)
            else:
                session_data[tool_name] = tool_input

            final_resume = ""
            for section_name in RESUME_TOOLS:
                section_input = session_data.get(section_name)
                if not section_input or (isinstance(section_input, list) and len(section_input) == 0):
                    continue
                if isinstance(section_input, list):
                    for item in section_input:
                        final_resume += await call_mcp_tool(section_name, item, session_id) + "\n\n"
                else:
                    final_resume += await call_mcp_tool(section_name, section_input, session_id) + "\n\n"

            assistant_msg = Message(chat_id=chat.id, role="assistant", content=final_resume.strip())
            db.add(assistant_msg)
            db.commit()
            return {"final_output": final_resume.strip()}

        resp = await fallback_handler(query_with_file, session_id, llm)
        assistant_msg = Message(chat_id=chat.id, role="assistant", content=resp)
        db.add(assistant_msg)
        db.commit()
        return {"final_output": resp}


async def run_resume_agent(query: str, session_id: Optional[str] = None, db: Optional[Session] = None) -> Any:
    ctx = {"session_id": session_id or DEFAULT_SESSION}
    r = await Runner.run(RESUME_AGENT, query, ctx, db=db)
    return r.get("final_output")
