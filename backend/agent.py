import asyncio
import inspect
import json
import logging
import concurrent.futures
from typing import Any, Callable, Dict, Optional, List
from pathlib import Path

import pdfplumber
from docx import Document
from langchain.schema import HumanMessage, SystemMessage
from langchain.agents import Tool, initialize_agent, AgentType
from langchain_openai import ChatOpenAI
from sqlalchemy.orm import Session

from database.db import get_db, engine, Base
from database.models import Chat, Message
from prompt import SYSTEM_PROMPT
from tools import personal_info, summary, experience, education, skills, projects, achievements

Base.metadata.create_all(bind=engine)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

DEFAULT_SESSION = "default_session"


session_store: Dict[str, Dict[str, Any]] = {}

RESUME_TOOLS = ["personal_info", "summary", "experience", "education", "skills", "projects", "achievements"]



async def call_tool(tool_func: Callable[..., Any], input_data: Any, session_id: str) -> Any:
    sid = session_id or DEFAULT_SESSION
    query = ""
    if isinstance(input_data, str):
        try:
            parsed = json.loads(input_data)
            if isinstance(parsed, dict):
                query = parsed.get("query", "")
                sid = parsed.get("session_id", sid)
            else:
                query = input_data
        except (json.JSONDecodeError, TypeError):
            query = input_data
    elif isinstance(input_data, dict):
        query = input_data.get("query", "")
        sid = input_data.get("session_id", sid)
    else:
        query = str(input_data)

    try:
        if inspect.iscoroutinefunction(tool_func):
            return await tool_func(query, sid)
        else:
            loop = asyncio.get_running_loop()
            return await loop.run_in_executor(None, lambda: tool_func(query, sid))
    except Exception as e:
        logger.exception("Error calling tool_func %s", getattr(tool_func, "__name__", str(tool_func)))
        return f"[tool_error] {str(e)}"



async def _personal_info_async(query, session_id): return await call_tool(personal_info.personal_info_tool, query,
                                                                          session_id)


async def _summary_async(query, session_id): return await call_tool(summary.summary_tool, query, session_id)


async def _experience_async(query, session_id): return await call_tool(experience.experience_tool, query, session_id)


async def _education_async(query, session_id): return await call_tool(education.education_tool, query, session_id)


async def _skills_async(query, session_id): return await call_tool(skills.skills_tool, query, session_id)


async def _projects_async(query, session_id): return await call_tool(projects.projects_tool, query, session_id)


async def _achievements_async(query, session_id): return await call_tool(achievements.achievements_tool, query,
                                                                         session_id)


def bridge_for(async_callable: Callable[[Any, str], Any]) -> Callable[[Any, Optional[str]], Any]:
    def sync_or_awaitable(input_data, session_id: Optional[str] = None):
        session = session_id or DEFAULT_SESSION
        coro = async_callable(input_data, session)
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None
        if loop and loop.is_running():
            return asyncio.create_task(coro)

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


personal_info_bridge = bridge_for(_personal_info_async)
summary_bridge = bridge_for(_summary_async)
experience_bridge = bridge_for(_experience_async)
education_bridge = bridge_for(_education_async)
skills_bridge = bridge_for(_skills_async)
projects_bridge = bridge_for(_projects_async)
achievements_bridge = bridge_for(_achievements_async)


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
                for tool in RESUME_TOOLS}
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

        if len(uploaded_files) > 1:
            prompt = f"[agent_prompt] Multiple files uploaded. Please select which file to use: {', '.join(uploaded_files)}"
            assistant_msg = Message(chat_id=chat.id, role="assistant", content=prompt)
            db.add(assistant_msg)
            db.commit()
            return {"final_output": prompt}

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

        if "build resume" in query.lower() or "create resume" in query.lower():
            final_resume = ""
            for tool_name in RESUME_TOOLS:
                tool_input = session_data.get(tool_name)
                if not tool_input or (isinstance(tool_input, list) and len(tool_input) == 0):
                    continue
                if isinstance(tool_input, list):
                    for item in tool_input:
                        output = await call_tool(getattr(tools_module(tool_name), f"{tool_name}_tool"), item,
                                                 session_id)
                        final_resume += output + "\n\n"
                else:
                    output = await call_tool(getattr(tools_module(tool_name), f"{tool_name}_tool"), tool_input,
                                             session_id)
                    final_resume += output + "\n\n"
            assistant_msg = Message(chat_id=chat.id, role="assistant", content=final_resume.strip())
            db.add(assistant_msg)
            db.commit()
            return {"final_output": final_resume.strip()}

        selected_tool = determine_tool_from_query(query)
        if not selected_tool:
            result = await fallback_handler(query_with_file, session_id, llm)
            assistant_msg = Message(chat_id=chat.id, role="assistant", content=result)
            db.add(assistant_msg)
            db.commit()
            return {"final_output": result}

        if selected_tool in ["experience", "education", "skills", "projects", "achievements"]:
            session_data[selected_tool].append(query)
        else:
            session_data[selected_tool] = query

        prompt = f"[agent_prompt] Please select which resume tool you want to use: {', '.join(RESUME_TOOLS)}"
        assistant_msg = Message(chat_id=chat.id, role="assistant", content=prompt)
        db.add(assistant_msg)
        db.commit()
        return {"final_output": prompt}


def tools_module(tool_name: str):
    return {
        "personal_info": personal_info,
        "summary": summary,
        "experience": experience,
        "education": education,
        "skills": skills,
        "projects": projects,
        "achievements": achievements
    }[tool_name]



async def run_resume_agent(query: str, session_id: Optional[str] = None, db: Optional[Session] = None) -> Any:
    ctx = {"session_id": session_id or DEFAULT_SESSION}
    r = await Runner.run(RESUME_AGENT, query, ctx, db=db)
    return r.get("final_output")
