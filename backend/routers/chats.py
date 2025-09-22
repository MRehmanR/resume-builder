from fastapi import APIRouter, Depends, UploadFile, File, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from uuid import uuid4
import os
from database.db import get_db
from database.models import Chat, Message, ResumeVersion
from agent import call_mcp_tool, RESUME_TOOLS, session_store, DEFAULT_SESSION

router = APIRouter(prefix="/chats", tags=["Chats"])


@router.post("/")
def create_chat(db: Session = Depends(get_db)):
    session_id = str(uuid4())
    new_chat = Chat(session_id=session_id)
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return {
        "session_id": new_chat.session_id,
        "chat_id": new_chat.id,
        "message": "Chat created successfully",
    }


def generate_chat_title(messages: list[Message], max_words: int = 7) -> str:
    title_candidates = []

    # Look at the first 5 messages
    for msg in messages[:5]:
        if msg.role == "user" and msg.content.strip():
            title_candidates.append(msg.content.strip())

    if not title_candidates:
        return "New Chat"

    first_text = " ".join(title_candidates)
    words = first_text.split()
    title = " ".join(words[:max_words])
    return title + "..." if len(words) > max_words else title


@router.get("/")
def list_chats(db: Session = Depends(get_db)):
    chats = db.query(Chat).all()
    result = []

    for c in chats:
        messages = [
            {"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at}
            for m in c.messages
        ]
        title = c.title or generate_chat_title(c.messages)
        result.append({
            "id": c.session_id,
            "chat_id": c.id,
            "title": title,
            "messages": messages,
        })

    return result


@router.get("/{session_id}")
def get_chat(session_id: str, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.session_id == session_id).first()
    if not chat:
        return {"error": "Chat not found"}

    resume_version = db.query(ResumeVersion).filter(ResumeVersion.session_id == session_id).first()

    return {
        "id": chat.session_id,
        "chat_id": chat.id,
        "final_resume": resume_version.content if resume_version else None,
        "messages": [
            {"id": m.id, "role": m.role, "content": m.content, "created_at": m.created_at}
            for m in chat.messages
        ],
    }


@router.delete("/{session_id}")
def delete_chat(session_id: str, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.session_id == session_id).first()
    if not chat:
        return {"error": "Chat not found"}
    db.delete(chat)
    db.commit()
    return {"message": f"Chat {session_id} deleted successfully"}


@router.post("/{session_id}/upload")
async def upload_file(session_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    temp_dir = "uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, f"{uuid4()}_{file.filename}")

    try:
        with open(file_path, "wb") as f:
            f.write(await file.read())

        chat = db.query(Chat).filter(Chat.session_id == session_id).first()
        if not chat:
            chat = Chat(session_id=session_id)
            db.add(chat)
            db.commit()
            db.refresh(chat)

        attachment_msg = Message(
            chat_id=chat.id,
            role="user",
            content=f"[Attachment] {os.path.basename(file_path)}",
        )
        db.add(attachment_msg)
        db.commit()
        db.refresh(attachment_msg)

        return {
            "session_id": chat.session_id,
            "chat_id": chat.id,
            "message": f"File '{file.filename}' uploaded successfully.",
            "file_path": file_path,
        }

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.post("/update_section")
async def update_section_endpoint(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    section = body.get("section")
    content = body.get("content")
    session_id = body.get("session_id", DEFAULT_SESSION)

    if section not in RESUME_TOOLS:
        return {"error": f"Invalid section: {section}"}

    chat = db.query(Chat).filter(Chat.session_id == session_id).first()
    if not chat:
        chat = Chat(session_id=session_id)
        db.add(chat)
        db.commit()
        db.refresh(chat)

    update_msg = Message(
        chat_id=chat.id,
        role="assistant",
        content=f"[Update Section] {section}: {content}"
    )
    db.add(update_msg)
    db.commit()

    if session_id not in session_store:
        session_store[session_id] = {
            tool: [] if tool in ["experience", "education", "skills", "projects", "achievements"] else None
            for tool in RESUME_TOOLS
        }

    session_data = session_store[session_id]

    if section in ["experience", "education", "skills", "projects", "achievements"]:
        session_data[section] = [content]
    else:
        session_data[section] = content

    final_resume = ""
    for tool_name in RESUME_TOOLS:
        section_input = session_data.get(tool_name)
        if not section_input:
            continue
        if isinstance(section_input, list):
            for item in section_input:
                final_resume += await call_mcp_tool(tool_name, item, session_id) + "\n\n"
        else:
            final_resume += await call_mcp_tool(tool_name, section_input, session_id) + "\n\n"

    final_resume = final_resume.strip()

    resume_version = db.query(ResumeVersion).filter(ResumeVersion.session_id == session_id).first()
    if resume_version:
        resume_version.content = final_resume
    else:
        resume_version = ResumeVersion(session_id=session_id, content=final_resume)
        db.add(resume_version)

    db.commit()

    return {"result": final_resume}
