"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileText, Download } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import html2pdf from "html2pdf.js"
import { ATSFormat } from "../components/resume-formats/ats-format"
import { ModernFormat } from "../components/resume-formats/modern-format"
import { SidebarFormat } from "../components/resume-formats/sidebar-format"
import { CreativeFormat } from "../components/resume-formats/creative-format"
import { ExecutiveFormat } from "../components/resume-formats/executive-format"

const MCP_URL = "http://localhost:8000/mcp/tools/resume_agent"

// Extract section by heading (works for ## Summary, ## Skills, etc.)
const extractSection = (markdown: string, section: string) => {
  const regex = new RegExp(`## ${section}[\\s\\S]*?(?=##|$)`, "i")
  const match = markdown.match(regex)
  return match ? match[0].replace(`## ${section}`, "").trim() : ""
}

// Extract personal info (updated to match Markdown list format)
const extractPersonalInfo = (raw: string) => {
  const personalSection = extractSection(raw, "Personal Information") || raw

  const matchName = personalSection.match(/[-*]\s*\*\*Name\*\*:\s*(.+)/i)
  const matchPhone = personalSection.match(/[-*]\s*\*\*Phone\*\*:\s*(.+)/i)
  const matchEmail = personalSection.match(/[-*]\s*\*\*Email\*\*:\s*(.+)/i)
  const matchLinkedIn = personalSection.match(/[-*]\s*\*\*LinkedIn\*\*:\s*(.+)/i)
  const matchGitHub = personalSection.match(/[-*]\s*\*\*GitHub\*\*:\s*(.+)/i)

  return {
    name: matchName ? matchName[1].trim() : "",
    phone: matchPhone ? matchPhone[1].trim() : "",
    email: matchEmail ? matchEmail[1].trim() : "",
    linkedin: matchLinkedIn ? matchLinkedIn[1].trim() : "",
    github: matchGitHub ? matchGitHub[1].trim() : "",
  }
}

interface ResumeData {
  name?: string
  title?: string
  email?: string
  phone?: string
  linkedin?: string
  github?: string
  summary: string
  skills: string
  experience: string
  education: string
  projects: string
  achievements: string
}

const ResumePreview = () => {
  const [searchParams] = useSearchParams()
  const session_id = searchParams.get("session_id") || ""
  const [format, setFormat] = useState("ats")
  const [resume, setResume] = useState<ResumeData>({
    summary: "",
    skills: "",
    experience: "",
    education: "",
    projects: "",
    achievements: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const resumeRef = useRef<HTMLDivElement>(null)

  const fetchPreview = async () => {
    if (!session_id) {
      toast({
        title: "Missing session",
        description: "Session ID not found. Please start from chat.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${MCP_URL}/preview?session_id=${session_id}`)
      const data = await response.json()
      const raw = data.result || ""

      const personalInfo = extractPersonalInfo(raw)

      setResume({
        ...personalInfo,
        summary: extractSection(raw, "Summary") || extractSection(raw, "Professional Summary"),
        skills: extractSection(raw, "Skills"),
        experience: extractSection(raw, "Experience"),
        education: extractSection(raw, "Education"),
        projects: extractSection(raw, "Projects"),
        achievements: extractSection(raw, "Achievements"),
      })
    } catch (err) {
      toast({
        title: "Preview failed",
        description: "Could not load resume preview.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPreview()
  }, [format])

  const handleDownload = () => {
    if (!resumeRef.current) return
    const element = resumeRef.current

    const opt = {
      margin: 0.5,
      filename: `resume-${format}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    }

    html2pdf().set(opt).from(element).save()
  }

  const renderResumeFormat = () => {
    const formatProps = { resume }

    switch (format) {
      case "ats":
        return <ATSFormat {...formatProps} />
      case "modern":
        return <ModernFormat {...formatProps} />
      case "sidebar":
        return <SidebarFormat {...formatProps} />
      case "creative":
        return <CreativeFormat {...formatProps} />
      case "executive":
        return <ExecutiveFormat {...formatProps} />
      default:
        return <ATSFormat {...formatProps} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/chat">
              <Button variant="brand-ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-brand" />
              <h1 className="text-lg font-semibold bg-gradient-brand bg-clip-text text-transparent">
                Resume Preview: {resume.name || "—"}
              </h1>
            </div>
          </div>

          {/* Download Button */}
          <Button variant="default" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Resume Preview</CardTitle>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ats">ATS Format</SelectItem>
                <SelectItem value="modern">Modern Format</SelectItem>
                <SelectItem value="sidebar">Sidebar Format</SelectItem>
                <SelectItem value="creative">Creative Format</SelectItem>
                <SelectItem value="executive">Executive Format</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <Separator />

          <CardContent>
            <ScrollArea className="h-[80vh] p-6 border rounded-lg bg-white shadow-sm">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              ) : (
                <div ref={resumeRef} className="w-full">
                  {renderResumeFormat()}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResumePreview
