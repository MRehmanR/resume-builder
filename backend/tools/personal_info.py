from fastapi import APIRouter
from database.schemas import PersonalInfoRequest
from llm import chat_with_llm

router = APIRouter()


async def personal_info_tool(query: str, session_id: str) -> dict:
    """
    Extract personal info (name, email, phone) from text.
    """
    system_prompt = "You are a resume parser. Extract personal info in JSON format."
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]
    result_text = await chat_with_llm(messages)  # async
    return {"result": result_text}


@router.post("/personal-info/")
async def personal_info_api(request: PersonalInfoRequest):
    return await personal_info_tool(request.query, request.session_id)
