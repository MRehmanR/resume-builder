from fastapi import FastAPI, Request, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastmcp import FastMCP
from sqlalchemy.orm import Session
from database.db import get_db, engine, Base
from database.models import Chat, Message
from agent import RESUME_AGENT, Runner, DEFAULT_SESSION
from routers import chats
import os
import re
from uuid import uuid4
import logging
import uvicorn
from agent import RESUME_TOOLS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Resume Builder MCP Host")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")
app.include_router(chats.router)


@app.get("/")
def serve_frontend():
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"status": "Frontend not found, but API is running"}


@app.get("/health")
def health_check():
    return {"status": "Resume Builder API is running with MCP"}


@app.post("/session/create")
def create_session(db: Session = Depends(get_db)):
    session_id = str(uuid4())
    new_chat = Chat(session_id=session_id)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    logger.info(f"Created new session: {session_id}")
    return {"session_id": new_chat.session_id, "chat_id": new_chat.id, "message": "Session created successfully"}


@app.delete("/session/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.session_id == session_id).first()
    if chat:
        db.delete(chat)
        db.commit()
        logger.info(f"Deleted session: {session_id}")
        return {"message": f"Session {session_id} deleted successfully"}
    return {"error": "Session not found"}


@app.get("/session/{session_id}/history")
def get_history(session_id: str, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.session_id == session_id).first()
    if not chat:
        return {"messages": []}
    return {
        "session_id": chat.session_id,
        "messages": [
            {"role": m.role, "content": m.content, "created_at": m.created_at}
            for m in chat.messages
        ],
    }


mcp = FastMCP(name="ResumeMCPHost")
logger.info("FastMCP server initialized and ready.")


@app.post("/mcp/tools/resume_agent")
async def resume_agent(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    query = body.get("query", "")
    session_id = body.get("session_id", DEFAULT_SESSION)
    logger.info(f"[MCP CALL] resume_agent called | Session: {session_id} | Query: {query[:100]}...")

    try:
        result = await Runner.run(RESUME_AGENT, query, context={"session_id": session_id}, db=db)
        logger.info(
            f"[MCP RESPONSE] resume_agent | Session: {session_id} | Output: {str(result['final_output'])[:100]}...")
        return {"result": result["final_output"]}
    except Exception as e:
        logger.error(f"[MCP ERROR] resume_agent | Session: {session_id} | Error: {e}")
        return {"error": str(e)}


for tool_name in RESUME_TOOLS:
    endpoint = f"/mcp/tools/{tool_name}"


    async def tool_endpoint(request: Request, tool=tool_name, db: Session = Depends(get_db)):
        body = await request.json()
        query = body.get("query", "")
        session_id = body.get("session_id", DEFAULT_SESSION)
        logger.info(f"[MCP CALL] Tool: {tool} | Session: {session_id} | Input: {query[:100]}...")
        try:
            result = await Runner.run(RESUME_AGENT, query, context={"session_id": session_id}, db=db)
            output = result["final_output"]
            logger.info(f"[MCP RESPONSE] Tool: {tool} | Session: {session_id} | Output: {str(output)[:100]}...")
            return {"result": output}
        except Exception as e:
            logger.error(f"[MCP ERROR] Tool: {tool} | Session: {session_id} | Error: {e}")
            return {"error": str(e)}


    app.post(endpoint)(tool_endpoint)


def extract_resume_content(text: str) -> str:
    if not text:
        return "No resume content found."
    match = re.search(r"(##|###|1\.)", text)
    if match:
        return text[match.start():].strip()
    return text.strip()


@app.get("/mcp/tools/resume_agent/preview")
def preview_resume(session_id: str = Query(DEFAULT_SESSION), db: Session = Depends(get_db)):
    """
    Preview the latest generated resume content for the session.
    Combines all RESUME_TOOLS output stored in chat messages.
    """
    chat = db.query(Chat).filter(Chat.session_id == session_id).first()
    if not chat:
        return {"result": "No resume data found."}

    resume_content_parts = []
    for msg in chat.messages:
        if msg.role == "assistant" and msg.content:
            if any(tool in msg.content.lower() for tool in RESUME_TOOLS):
                resume_content_parts.append(msg.content)

    if not resume_content_parts:
        for msg in reversed(chat.messages):
            if msg.role == "assistant" and msg.content:
                resume_content_parts.append(msg.content)
                break

    if not resume_content_parts:
        return {"result": "No resume data found."}

    resume_text = "\n\n".join(resume_content_parts)

    def extract_resume_content(text: str) -> str:
        import re
        match = re.search(r"(##|###|1\.)", text)
        if match:
            return text[match.start():].strip()
        return text.strip()

    cleaned_resume = extract_resume_content(resume_text)
    return {"result": cleaned_resume}


if __name__ == "__main__":
    logger.info("Starting Resume Builder MCP server...")
    uvicorn.run("mcp_host:app", host="0.0.0.0", port=8000, reload=True)
