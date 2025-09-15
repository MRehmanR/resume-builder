# from fastapi import FastAPI, Query
# from agent import run_resume_agent, conversation_history, DEFAULT_SESSION
# import re
#
# app = FastAPI()
#
#
# def extract_resume_content(text: str) -> str:
#     """
#     Extract only resume-relevant content (headings, lists, etc.).
#     Fallback: return the full text.
#     """
#     if not text:
#         return "No resume content found."
#
#     match = re.search(r"(##|###|1\.)", text)
#     if match:
#         return text[match.start():].strip()
#
#     return text.strip()
#
#
# # @app.post("/mcp/tools/resume_agent")
# # async def resume_agent(payload: dict):
# #     query = payload.get("query", "")
# #     session_id = payload.get("session_id", DEFAULT_SESSION)
# #
# #     result = await run_resume_agent(query, session_id)
# #     return {"result": result}
#
#
# @app.get("/mcp/tools/resume_agent/preview")
# async def preview_resume(session_id: str = Query(DEFAULT_SESSION), format: str = "ats"):
#     history = conversation_history.get(session_id)
#     if not history:
#         return {"result": "No resume data found."}
#
#     resume_md = f"""
# # Resume
#
# ## Personal Information
# {history.get("personal_info", "")}
#
# ## Summary
# {history.get("summary", "")}
#
# ## Experience
# {history.get("experience", "")}
#
# ## Education
# {history.get("education", "")}
#
# ## Skills
# {history.get("skills", "")}
#
# ## Projects
# {history.get("projects", "")}
#
# ## Achievements
# {history.get("achievements", "")}
# """.strip()
#
#     return {"result": resume_md}
#
