"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const MCP_URL = "http://localhost:8000/mcp/tools/ats_scoring"

const ATSScoring = () => {
  const [resumeText, setResumeText] = useState("")
  const [jdText, setJdText] = useState("")
  const [score, setScore] = useState("")
  const { toast } = useToast()

  const calculateScore = async () => {
    if (!resumeText.trim() || !jdText.trim()) return
    try {
      const res = await fetch(MCP_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: resumeText, jd: jdText }) })
      const data = await res.json()
      setScore(data.result || "No score")
    } catch {
      toast({ title: "Error", description: "ATS scoring failed", variant: "destructive" })
    }
  }

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-lg font-bold mb-4">AI ATS Scoring</h1>
      <Textarea placeholder="Paste resume..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={4}/>
      <Textarea placeholder="Paste job description..." value={jdText} onChange={(e) => setJdText(e.target.value)} rows={4}/>
      <Button onClick={calculateScore}>Calculate ATS Score</Button>
      {score && <pre className="mt-4 p-3 bg-muted rounded">{score}</pre>}
    </div>
  )
}

export default ATSScoring
