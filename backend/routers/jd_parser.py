# routers/jd_parser.py
from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from agent import Runner, RESUME_AGENT, DEFAULT_SESSION
from database.db import get_db

router = APIRouter(prefix="/jd_parser", tags=["JD Parser"])

@router.post("/tailor_resume")
async def tailor_resume(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    session_id = data.get("session_id", DEFAULT_SESSION)
    resume_text = data.get("resume_text", "")
    jd_text = data.get("job_description", "")
    if not resume_text or not jd_text:
        return {"error": "Resume text or job description missing."}

    prompt = f"Tailor the following resume to this job description:\nJD: {jd_text}\nResume: {resume_text}\n- Highlight missing skills\n- Suggest reordering for relevance\n- Standardize tone/style"
    result = await Runner.run(RESUME_AGENT, prompt, context={"session_id": session_id}, db=db)
    return {"tailored_resume": result["final_output"]}
