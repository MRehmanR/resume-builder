"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const MCP_URL = "http://localhost:8000/mcp/tools/gap_detection"

const GapDetection = () => {
  const [resumeText, setResumeText] = useState("")
  const [result, setResult] = useState("")
  const { toast } = useToast()

  const detectGaps = async () => {
    if (!resumeText.trim()) return
    try {
      const res = await fetch(MCP_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: resumeText }) })
      const data = await res.json()
      setResult(data.result || "No gaps detected")
    } catch {
      toast({ title: "Error", description: "Gap detection failed", variant: "destructive" })
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">Resume Gap Detection</h1>
      <Textarea placeholder="Paste resume text..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={6}/>
      <Button className="mt-2" onClick={detectGaps}>Detect Gaps</Button>
      {result && <pre className="mt-4 p-3 bg-muted rounded">{result}</pre>}
    </div>
  )
}

export default GapDetection
