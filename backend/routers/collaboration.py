# routers/collaboration.py
from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import ResumeVersion

router = APIRouter(prefix="/collaboration", tags=["Collaboration"])


@router.post("/save_version")
async def save_version(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    session_id = data.get("session_id")
    resume_name = data.get("resume_name", "Untitled Resume")
    resume_text = data.get("resume_text", "")
    if not session_id or not resume_text:
        return {"error": "Missing session_id or resume_text."}

    version = ResumeVersion(session_id=session_id, name=resume_name, content=resume_text)
    db.add(version)
    db.commit()
    db.refresh(version)
    return {"message": "Resume version saved", "version_id": version.id}


@router.get("/versions/{session_id}")
def get_versions(session_id: str, db: Session = Depends(get_db)):
    versions = db.query(ResumeVersion).filter(ResumeVersion.session_id == session_id).all()
    return {"versions": [{"id": v.id, "name": v.name, "created_at": v.created_at} for v in versions]}
