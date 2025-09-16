"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Message {
  id: string
  role: "user" | "bot" | "system"
  content: string
  created_at?: string
}

const MCP_URL = "http://localhost:8000/mcp/tools/manual_editor"

const ManualEditor = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: inputMessage }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      const res = await fetch(MCP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: inputMessage }),
      })
      const data = await res.json()
      if (data.result) {
        const botMessage: Message = { id: Date.now().toString(), role: "bot", content: data.result }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: "bot", content: "⚠️ Error: Could not reach server." }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <h1 className="text-lg font-semibold bg-gradient-brand bg-clip-text text-transparent">Manual Resume Editor</h1>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <ScrollArea ref={scrollRef} className="flex-1 px-6 py-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user" ? "bg-brand text-white" : msg.role === "system" ? "bg-yellow-100 text-yellow-900" : "bg-muted"}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isTyping && <div className="text-muted">Typing...</div>}
          </ScrollArea>
          <div className="p-4 flex space-x-2 border-t">
            <Textarea
              placeholder="Edit or ask AI..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              className="flex-1 resize-none"
              rows={1}
            />
            <Button variant="brand" onClick={sendMessage} disabled={!inputMessage.trim()}><Send className="h-4 w-4"/></Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManualEditor
