from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from agent import Runner, RESUME_AGENT, DEFAULT_SESSION
from database.db import get_db

router = APIRouter(prefix="/manual_editor", tags=["Manual Editor"])


@router.post("/sync")
async def manual_editor_sync(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    session_id = data.get("session_id", DEFAULT_SESSION)
    user_text = data.get("text", "")
    if not user_text:
        return {"error": "No text provided."}

    prompt = f"Polish the following resume section with measurable, impact-driven bullet points:\n{user_text}"
    result = await Runner.run(RESUME_AGENT, prompt, context={"session_id": session_id}, db=db)
    return {"polished_text": result["final_output"]}
