from fastapi import APIRouter
from database.schemas import EducationRequest
from llm import chat_with_llm

router = APIRouter()

async def education_tool(query: str, session_id: str) -> dict:
    system_prompt = "You are a professional resume assistant. Format the user's education details for a resume."
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]
    result_text = chat_with_llm(messages)
    return {"result": result_text}

@router.post("/education/")
async def education_api(request: EducationRequest):
    return await education_tool(request.query, request.session_id)
