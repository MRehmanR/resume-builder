"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, FileText, Download, Edit } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import html2pdf from "html2pdf.js"

import { ATSFormat } from "../components/resume-formats/ats-format"
import { ModernFormat } from "../components/resume-formats/modern-format"
import { SidebarFormat } from "../components/resume-formats/sidebar-format"
import { CreativeFormat } from "../components/resume-formats/creative-format"
import { ExecutiveFormat } from "../components/resume-formats/executive-format"
import { EuropassFormat } from "../components/resume-formats/europass-format"
import ResumeEditor from "../pages/ResumeEditors"

const MCP_URL = "http://localhost:8000/mcp/tools/resume_agent"

// --- helpers ---
const extractSection = (markdown: string, section: string) => {
  const regex = new RegExp(`## ${section}[\\s\\S]*?(?=##|$)`, "i")
  const match = markdown.match(regex)
  return match ? match[0].replace(`## ${section}`, "").trim() : ""
}

const extractPersonalInfo = (raw: string) => {
  const personalSection = extractSection(raw, "Personal Information") || raw
  const matchField = (field: string) =>
    personalSection.match(new RegExp(`[-*]\\s*(\\*\\*)?${field}(\\*\\*)?:\\s*(.+)`, "i"))

  return {
    name: matchField("Name")?.[3]?.trim() || "",
    phone: matchField("Phone")?.[3]?.trim() || "",
    email: matchField("Email")?.[3]?.trim() || "",
    linkedin: matchField("LinkedIn")?.[3]?.trim() || "",
    github: matchField("GitHub")?.[3]?.trim() || "",
  }
}

// --- types ---
interface ResumeData {
  name?: string
  title?: string
  email?: string
  phone?: string
  linkedin?: string
  github?: string
  nationality?: string
  dateOfBirth?: string
  gender?: string
  summary: string
  skills: string
  experience: string
  education: string
  projects: string
  achievements: string
  languages?: string
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
  const [editOpen, setEditOpen] = useState(false)

  const { toast } = useToast()
  const resumeRef = useRef<HTMLDivElement>(null)
  const hiddenResumeRef = useRef<HTMLDivElement>(null)

  // --- fetch resume preview ---
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
        languages: extractSection(raw, "Languages"),
      })
    } catch {
      toast({
        title: "Preview failed",
        description: "Could not load resume preview.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // initial load & refetch on format change
  useEffect(() => {
    fetchPreview()
  }, [format])

  // --- handle PDF download ---
  const handleDownload = () => {
    if (!hiddenResumeRef.current) return
    const element = hiddenResumeRef.current

    const opt = {
      margin: [0.2, 0.2, 0.2, 0.2],
      filename: `resume-${format}.pdf`,
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: { scale: 3, scrollY: -window.scrollY, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    }

    html2pdf().set(opt).from(element).save()
  }

  // --- resume renderer ---
  const renderResumeFormat = (isHidden = false) => {
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
      case "europass":
        return <EuropassFormat {...formatProps} />
      default:
        return <ATSFormat {...formatProps} />
    }
  }

  // --- when editor saves ---
  const handleEditorSave = (updatedSections: Record<string, string>) => {
    setResume((prev) => ({ ...prev, ...updatedSections }))
    setEditOpen(false)
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

          <div className="flex items-center space-x-2">
            <Button variant="default" onClick={() => setEditOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="default" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
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
                <SelectItem value="europass">Europass Format</SelectItem>
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

            {/* Hidden for PDF export */}
            <div className="hidden">
              <div
                ref={hiddenResumeRef}
                className="w-full p-6 bg-white"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  boxSizing: "border-box",
                }}
              >
                {renderResumeFormat(true)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resume Editor */}
      <ResumeEditor
        session_id={session_id}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEditorSave}
      />

      {/* Global CSS for page breaks */}
      <style>
        {`
          .resume-section {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          .resume-section h2 {
            page-break-after: avoid;
          }
        `}
      </style>
    </div>
  )
}

export default ResumePreview
