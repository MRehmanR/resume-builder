import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def chat_with_llm(messages: list, model: str = "gpt-3.5-turbo", temperature: float = 0.7) -> str:
    """
    Sends chat messages to OpenAI and returns the response text.
    """
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature
    )
    return response.choices[0].message.content
