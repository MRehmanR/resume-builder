from fastapi import APIRouter
from database.schemas import AchievementsRequest
from llm import chat_with_llm

router = APIRouter()


async def achievements_tool(query: str, session_id: str) -> dict:
    system_prompt = "You are a professional resume assistant. Extract key achievements and format them for a resume."
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]
    result_text =  chat_with_llm(messages)
    return {"result": result_text}


@router.post("/achievements/")
async def achievements_api(request: AchievementsRequest):
    return await achievements_tool(request.query, request.session_id)
