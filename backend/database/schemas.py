from pydantic import BaseModel
from typing import Optional, List


class QueryRequest(BaseModel):
    query: str


class ToolResponse(BaseModel):
    result: str


class ResumeBase(BaseModel):
    personal_info: Optional[str] = None
    summary: Optional[str] = None
    experience: Optional[List[str]] = []
    education: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    projects: Optional[List[str]] = []
    achievements: Optional[List[str]] = []


class SummaryRequest(BaseModel):
    query: str
    session_id: str


class PersonalInfoRequest(BaseModel):
    query: str
    session_id: str


class ExperienceRequest(BaseModel):
    query: str
    session_id: str



class EducationRequest(BaseModel):
    query: str
    session_id: str


class SkillsRequest(BaseModel):
    query: str
    session_id: str


class ProjectsRequest(BaseModel):
    query: str
    session_id: str


class AchievementsRequest(BaseModel):
    query: str
    session_id: str
