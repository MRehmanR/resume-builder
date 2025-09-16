"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const MCP_URL = "http://localhost:8000/mcp/tools/collaboration"

const Collaboration = () => {
  const [resumeText, setResumeText] = useState("")
  const [email, setEmail] = useState("")
  const [result, setResult] = useState("")
  const { toast } = useToast()

  const shareResume = async () => {
    if (!resumeText.trim() || !email.trim()) return
    try {
      const res = await fetch(MCP_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: resumeText, email }) })
      const data = await res.json()
      setResult(data.result || "Shared successfully")
    } catch {
      toast({ title: "Error", description: "Collaboration failed", variant: "destructive" })
    }
  }

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-lg font-bold mb-4">Share Resume</h1>
      <Textarea placeholder="Paste resume..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={6}/>
      <Textarea placeholder="Mentor/Recruiter email..." value={email} onChange={(e) => setEmail(e.target.value)} rows={1}/>
      <Button onClick={shareResume}>Share</Button>
      {result && <pre className="mt-4 p-3 bg-muted rounded">{result}</pre>}
    </div>
  )
}

export default Collaboration
