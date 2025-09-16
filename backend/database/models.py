from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, func, Text
from sqlalchemy.orm import relationship
from database.db import Base


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    title = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    messages = relationship("Message", back_populates="chat", cascade="all, delete")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"))
    role = Column(String, nullable=False)  # "user" or "assistant"
    content = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    chat = relationship("Chat", back_populates="messages")


class ResumeVersion(Base):
    __tablename__ = "resume_versions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    name = Column(String, default="Untitled Resume")
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
