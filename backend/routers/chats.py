
from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from uuid import uuid4
import os

from database.db import get_db
from database.models import Chat, Message

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
    return {
        "id": chat.session_id,
        "chat_id": chat.id,
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
