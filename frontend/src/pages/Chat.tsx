"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Upload, Eye, Send, Bot, ArrowLeft, Sparkles, Plus, Trash } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  id: string
  role: "user" | "bot" | "system"
  content: string
  created_at?: string
}

interface ChatSession {
  id: string
  chat_id: number
  messages: Message[]
}

const API_BASE = "http://localhost:8000"
const MCP_URL = `${API_BASE}/mcp/tools/resume_agent`

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const chatListRef = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  // --- Load chats on mount ---
  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const res = await fetch(`${API_BASE}/chats/`)
      const data = await res.json()
      setChatHistory(data)
      if (data.length > 0 && !activeChatId) {
        const last = data[data.length - 1]
        setActiveChatId(last.id)
        setMessages(last.messages ?? [])
      }
    } catch {
      toast({ title: "Error", description: "Failed to load chats", variant: "destructive" })
    }
  }

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight
    }
  }, [messages, chatHistory])

  // --- Ensure a chat exists ---
  const ensureActiveChat = async (): Promise<string> => {
    if (activeChatId) return activeChatId
    const res = await fetch(`${API_BASE}/chats/`, { method: "POST" })
    const data = await res.json()
    const newChat: ChatSession = { id: data.session_id, chat_id: data.chat_id, messages: [] }
    setChatHistory((prev) => [...prev, newChat])
    setActiveChatId(newChat.id)
    setMessages([])
    return newChat.id
  }

  // --- Send user message ---
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return
    const chatId = await ensureActiveChat()

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      const res = await fetch(MCP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inputMessage, session_id: chatId }),
      })
      const data = await res.json()
      if (data.result) {
        const botMessage: Message = {
          id: Date.now().toString(),
          role: "bot",
          content: data.result,
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "⚠️ Error: Could not reach server.",
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  // --- Refresh chat ---
  const refreshChat = async (chatId: string) => {
    try {
      const res = await fetch(`${API_BASE}/chats/${chatId}`)
      const chat = await res.json()
      setMessages(chat.messages ?? [])
      setChatHistory((prev) =>
        prev.map((c) => (c.id === chatId ? chat : c))
      )
    } catch {
      toast({ title: "Error", description: "Failed to refresh chat", variant: "destructive" })
    }
  }

  // --- Handle file upload ---
  const handleFileUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".pdf,.doc,.docx"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const chatId = await ensureActiveChat()
      const formData = new FormData()
      formData.append("file", file)

      const uploadingMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        content: `📄 Uploading resume: ${file.name}...`,
      }
      setMessages((prev) => [...prev, uploadingMessage])

      try {
        const res = await fetch(`${API_BASE}/chats/${chatId}/upload`, {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        const attachmentMessage: Message = {
          id: Date.now().toString(),
          role: "system",
          content: `[Attachment] ${file.name}`,
        }
        setMessages((prev) => [...prev, attachmentMessage])

        toast({
          title: "Resume uploaded!",
          description: `${file.name} saved successfully.`,
        })

        await refreshChat(chatId)
      } catch (err: any) {
        toast({
          title: "Upload failed",
          description: err.message,
          variant: "destructive",
        })
      }
    }
    input.click()
  }

  // --- Preview resume ---
  const handlePreviewResume = () => {
    if (!activeChatId) return
    navigate(`/ResumePreview?session_id=${activeChatId}`)
  }

  // --- New chat ---
  const handleNewChat = async () => {
    const activeChat = chatHistory.find((c) => c.id === activeChatId)
    if (activeChat && activeChat.messages.length === 0) {
      toast({ title: "Info", description: "Current chat is empty.", variant: "default" })
      return
    }
    const res = await fetch(`${API_BASE}/chats/`, { method: "POST" })
    const data = await res.json()
    const newChat: ChatSession = { id: data.session_id, chat_id: data.chat_id, messages: [] }
    setChatHistory((prev) => [...prev, newChat])
    setActiveChatId(newChat.id)
    setMessages([])
  }

  // --- Switch chat ---
  const handleSelectChat = async (chatId: string) => {
    await refreshChat(chatId)
    setActiveChatId(chatId)
  }

  // --- Delete chat ---
  const handleDeleteChat = async (chatId: string) => {
    await fetch(`${API_BASE}/chats/${chatId}`, { method: "DELETE" })
    const remaining = chatHistory.filter((c) => c.id !== chatId)
    setChatHistory(remaining)
    if (chatId === activeChatId) {
      if (remaining.length > 0) {
        const last = remaining[remaining.length - 1]
        await refreshChat(last.id)
        setActiveChatId(last.id)
      } else {
        setActiveChatId(null)
        setMessages([])
      }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="brand-ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-brand" />
              <h1 className="text-lg font-semibold bg-gradient-brand bg-clip-text text-transparent">
                Resume Builder AI
              </h1>
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            <Bot className="h-3 w-3 mr-1" />
            AI Assistant Active
          </Badge>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {/* Sidebar */}
<div className="w-64 sm:w-56 md:w-64 border-r border-border flex flex-col">
  <div className="flex items-center justify-between p-4 border-b">
    <h2 className="flex items-center font-semibold">
      <Sparkles className="h-5 w-5 mr-2 text-brand" /> Chats
    </h2>
    <Button size="sm" variant="secondary" onClick={handleNewChat}>
      <Plus className="mr-1 h-4 w-4" /> New
    </Button>
  </div>

  <div ref={chatListRef} className="flex-1 overflow-y-auto px-2 py-3">
    <div className="space-y-2">
      {chatHistory.map((chat) => (
        <div key={chat.id} className="flex items-center justify-between space-x-2">
          <Button
            variant={chat.id === activeChatId ? "brand" : "outline"}
            className="flex-1 text-left"
            onClick={() => handleSelectChat(chat.id)}
          >
            {chat.title || `Chat ${chat.chat_id}`}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteChat(chat.id)}>
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}

      {chatHistory.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-6">
          No chats yet — start by typing a message.
        </p>
      )}
    </div>
  </div>

  {/* Feature buttons */}
  <div className="p-4 border-t space-y-2">
    <Button variant="brand" onClick={handleFileUpload} className="w-full">
      <Upload className="h-5 w-5 mr-2" /> Upload Resume
    </Button>
    <Button variant="brand-outline" onClick={handlePreviewResume} className="w-full">
      <Eye className="h-5 w-5 mr-2" /> Preview Resume
    </Button>
    <Button variant="outline" onClick={() => navigate("/manual_editor")} className="w-full">
      Manual Editor
    </Button>
    <Button variant="outline" onClick={() => navigate("/jd_parser")} className="w-full">
      JD Parser
    </Button>
    <Button variant="outline" onClick={() => navigate("/gap_detection")} className="w-full">
      Gap Detection
    </Button>
    <Button variant="outline" onClick={() => navigate("/ats_scoring")} className="w-full">
      ATS Scoring
    </Button>
    <Button variant="outline" onClick={() => navigate("/collaboration")} className="w-full">
      Collaboration
    </Button>
  </div>
</div>


        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-brand text-white"
                        : message.role === "system"
                        ? "bg-yellow-100 text-yellow-900"
                        : "bg-muted"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                    {message.created_at && (
                      <span className="text-xs text-muted-foreground block mt-1">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-4 flex space-x-2 border-t">
            <Textarea
              placeholder="Ask me anything about your resume..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="flex-1 resize-none"
              rows={1}
            />
            <Button variant="brand" onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
