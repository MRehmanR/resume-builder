# routers/gap_detection.py
from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from agent import Runner, RESUME_AGENT, DEFAULT_SESSION
from database.db import get_db

router = APIRouter(prefix="/gap_detection", tags=["Gap Detection"])

@router.post("/analyze")
async def analyze_gaps(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    session_id = data.get("session_id", DEFAULT_SESSION)
    resume_text = data.get("resume_text", "")
    if not resume_text:
        return {"error": "No resume text provided."}

    prompt = f"Analyze the resume for gaps and weak sections, suggest improvements, and rewrite vague bullet points into measurable impact-driven points:\n{resume_text}"
    result = await Runner.run(RESUME_AGENT, prompt, context={"session_id": session_id}, db=db)
    return {"enhanced_resume": result["final_output"]}
