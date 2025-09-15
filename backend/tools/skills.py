from fastapi import APIRouter
from database.schemas import SkillsRequest
from llm import chat_with_llm

router = APIRouter()


async def skills_tool(query: str, session_id: str) -> dict:
    system_prompt = "You are a professional resume assistant. Extract key skills from user input for a resume."
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]
    result_text = await chat_with_llm(messages)
    return {"result": result_text}


@router.post("/skills/")
async def skills_api(request: SkillsRequest):
    return await skills_tool(request.query, request.session_id)
