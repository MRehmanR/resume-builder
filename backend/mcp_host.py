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

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
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
    return {"session_id": new_chat.session_id, "chat_id": new_chat.id, "message": "Session created successfully"}


@app.delete("/session/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.session_id == session_id).first()
    if chat:
        db.delete(chat)
        db.commit()
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

    try:
        result = await Runner.run(RESUME_AGENT, query, context={"session_id": session_id}, db=db)
        return {"result": result["final_output"]}
    except Exception as e:
        logger.error(f"Error in resume_agent: {e}")
        return {"error": str(e)}


def extract_resume_content(text: str) -> str:
    if not text:
        return "No resume content found."

    match = re.search(r"(##|###|1\.)", text)
    if match:
        return text[match.start():].strip()

    return text.strip()


@app.get("/mcp/tools/resume_agent/preview")
def preview_resume(session_id: str = Query(DEFAULT_SESSION), db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.session_id == session_id).first()
    if not chat:
        return {"result": "No resume data found."}

    last_response = ""
    for msg in reversed(chat.messages):
        if msg.role == "assistant":
            last_response = msg.content
            break

    if not last_response:
        return {"result": "No resume data found."}

    resume_only = extract_resume_content(last_response)
    return {"result": resume_only}


if __name__ == "__main__":
    logger.info("Starting Resume Builder MCP server...")

    uvicorn.run("mcp_host:app", host="0.0.0.0", port=8000, reload=True)
