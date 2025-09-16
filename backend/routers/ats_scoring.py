# routers/ats_scoring.py
from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from agent import Runner, RESUME_AGENT, DEFAULT_SESSION
from database.db import get_db

router = APIRouter(prefix="/ats_scoring", tags=["ATS Scoring"])

@router.post("/score")
async def ats_score(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    session_id = data.get("session_id", DEFAULT_SESSION)
    resume_text = data.get("resume_text", "")
    jd_text = data.get("job_description", "")
    if not resume_text or not jd_text:
        return {"error": "Resume text or job description missing."}

    prompt = f"Evaluate the resume against the job description for ATS compatibility:\nJD: {jd_text}\nResume: {resume_text}\n- Provide Resume Health Score (clarity, impact, ATS-friendly)\n- Highlight top missing skills\n- Show keyword density for ATS\n- Simulate first 10s recruiter scan"
    result = await Runner.run(RESUME_AGENT, prompt, context={"session_id": session_id}, db=db)
    return {"ats_report": result["final_output"]}
