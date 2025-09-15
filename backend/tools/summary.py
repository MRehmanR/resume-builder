from fastapi import APIRouter
from database.schemas import SummaryRequest
from llm import chat_with_llm

router = APIRouter()


async def summary_tool(query: str, session_id: str) -> dict:
    system_prompt = "You are a professional resume assistant. Write a concise, strong resume summary up to 5 to 6 lines."
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]
    result_text = await chat_with_llm(messages)
    return {"result": result_text}


@router.post("/summary/")
async def summary_api(request: SummaryRequest):
    return await summary_tool(request.query, request.session_id)
