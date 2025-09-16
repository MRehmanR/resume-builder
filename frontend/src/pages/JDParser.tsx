"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const MCP_URL = "http://localhost:8000/mcp/tools/jd_parser"

const JDParser = () => {
  const [jdText, setJdText] = useState("")
  const [result, setResult] = useState("")
  const { toast } = useToast()

  const analyzeJD = async () => {
    if (!jdText.trim()) return
    try {
      const res = await fetch(MCP_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: jdText }) })
      const data = await res.json()
      setResult(data.result || "No result")
    } catch {
      toast({ title: "Error", description: "JD analysis failed", variant: "destructive" })
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">Job Description Parser</h1>
      <Textarea placeholder="Paste job description..." value={jdText} onChange={(e) => setJdText(e.target.value)} rows={6}/>
      <Button className="mt-2" onClick={analyzeJD}>Analyze</Button>
      {result && <pre className="mt-4 p-3 bg-muted rounded">{result}</pre>}
    </div>
  )
}

export default JDParser
