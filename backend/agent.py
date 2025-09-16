import asyncio, inspect, json, logging, pdfplumber
from typing import Any, Callable, Dict, Optional
from pathlib import Path
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


async def call_tool(tool_func: Callable[..., Any], input_data: Any, session_id: str) -> str:
    sid = session_id or DEFAULT_SESSION
    query = str(input_data)

    try:
        if inspect.iscoroutinefunction(tool_func):
            output = await tool_func(query, sid)
        else:
            loop = asyncio.get_running_loop()
            output = await loop.run_in_executor(None, lambda: tool_func(query, sid))

        if isinstance(output, dict):
            output = json.dumps(output, ensure_ascii=False, indent=2)
        elif not isinstance(output, str):
            output = str(output)

        return output

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
    def wrapper(input_data, session_id: Optional[str] = None):
        sid = session_id or DEFAULT_SESSION
        coro = async_callable(input_data, sid)
        try:
            loop = asyncio.get_running_loop()
            if loop.is_running():
                return asyncio.create_task(coro)
        except RuntimeError:
            pass
        return asyncio.run(coro)

    return wrapper


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


async def llm_intent_handler(query: str, file_text: str, llm_model):
    prompt_text = SYSTEM_PROMPT.format(query=query, file_content=file_text)
    messages = [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=prompt_text)]
    response = await llm_model.agenerate([messages])
    return response.generations[0][0].text.strip().lower()


class Runner:
    @staticmethod
    async def run(agent, query: str, context: Optional[Dict] = None, db: Optional[Session] = None):
        if db is None:
            db_gen = get_db()
            db = next(db_gen)

        session_id = context.get("session_id", DEFAULT_SESSION) if context else DEFAULT_SESSION
        if session_id not in session_store:
            session_store[session_id] = {
                tool: [] if tool in ["experience", "education", "skills", "projects", "achievements"] else {}
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

        uploaded_files = [msg.content.replace("[Attachment]", "").strip() for msg in chat.messages if
                          msg.content.startswith("[Attachment]")]
        file_text = ""
        if uploaded_files:
            file_path = Path("uploads") / uploaded_files[0]
            if file_path.exists():
                try:
                    if file_path.suffix.lower() == ".pdf":
                        with pdfplumber.open(file_path) as pdf:
                            file_text = "\n".join([p.extract_text() or "" for p in pdf.pages])
                    elif file_path.suffix.lower() == ".docx":
                        doc = Document(file_path)
                        file_text = "\n".join([p.text for p in doc.paragraphs])
                except Exception as e:
                    logger.exception(f"Failed to read file {uploaded_files[0]}: {e}")
            logger.info(f"Extracted file text length: {len(file_text)}")

        intent = await llm_intent_handler(query, file_text, llm)
        logger.info(f"LLM determined intent: {intent}")

        if intent == "create_resume":
            final_resume = ""

            pi_input = query + "\n" + file_text
            personal_info_output = await call_tool(personal_info.personal_info_tool, pi_input, session_id)

            if isinstance(personal_info_output, str):
                try:
                    personal_info_output = json.loads(personal_info_output)
                except Exception:
                    personal_info_output = {}

            session_store[session_id]["personal_info"] = personal_info_output

            final_resume += "## Personal Information\n"
            for field in ["name", "phone", "email", "linkedin", "github"]:
                value = personal_info_output.get(field)
                if value:
                    field_name = field.capitalize()
                    if field in ["name", "phone", "email"]:
                        final_resume += f"- **{field_name}**: {value}\n"
                    else:
                        final_resume += f"- {field_name}: {value}\n"
            final_resume += "\n"

            for tool_name in RESUME_TOOLS:
                if tool_name == "personal_info":
                    continue
                tool_input = file_text
                output = await call_tool(getattr(tools_module(tool_name), f"{tool_name}_tool"), tool_input, session_id)

                if not output or output.strip() == "":
                    continue

                if not output.startswith("##"):
                    output = f"## {tool_name.replace('_', ' ').title()}\n{output.strip()}"

                final_resume += output + "\n\n"

            assistant_msg = Message(chat_id=chat.id, role="assistant", content=final_resume.strip())
            db.add(assistant_msg)
            db.commit()
            return {"final_output": final_resume.strip() or "[No content generated]"}

        elif intent == "ask_tool":
            prompt = f"Which section of your resume would you like to generate? Options: {', '.join(RESUME_TOOLS)}"
            assistant_msg = Message(chat_id=chat.id, role="assistant", content=prompt)
            db.add(assistant_msg)
            db.commit()
            return {"final_output": prompt}

        result = await fallback_handler(query, session_id, llm)
        assistant_msg = Message(chat_id=chat.id, role="assistant", content=result)
        db.add(assistant_msg)
        db.commit()
        return {"final_output": result or "[No response from LLM]"}


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


async def run_resume_agent(query: str, session_id: Optional[str] = None, db: Optional[Session] = None) -> str:
    ctx = {"session_id": session_id or DEFAULT_SESSION}
    r = await Runner.run(RESUME_AGENT, query, ctx, db=db)
    return r.get("final_output")
