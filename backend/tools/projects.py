from fastapi import APIRouter
from database.schemas import ProjectsRequest
from llm import chat_with_llm

router = APIRouter()


async def projects_tool(query: str, session_id: str) -> dict:
    system_prompt = "You are a professional resume assistant. Extract key projects and format for a resume."
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]
    result_text = chat_with_llm(messages)
    return {"result": result_text}


@router.post("/projects/")
async def projects_api(request: ProjectsRequest):
    return await projects_tool(request.query, request.session_id)
