from fastapi import APIRouter
from database.schemas import ExperienceRequest
from llm import chat_with_llm

router = APIRouter()


async def experience_tool(query: str, session_id: str) -> dict:
    system_prompt = "You are a professional resume writer. Improve work experience details for impact."
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]
    result_text = await chat_with_llm(messages)
    return {"result": result_text}


@router.post("/experience/")
async def experience_api(request: ExperienceRequest):
    return await experience_tool(request.query, request.session_id)
