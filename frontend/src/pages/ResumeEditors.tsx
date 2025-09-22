"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ResumeEditorProps {
  session_id: string
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSections: Record<string, string>) => void
}

const SECTIONS = ["summary", "skills", "experience", "education", "projects", "achievements"]

const ResumeEditor = ({ session_id, isOpen, onClose, onSave }: ResumeEditorProps) => {
  const [sections, setSections] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchSections = async () => {
    try {
      const res = await fetch(`http://localhost:8000/mcp/tools/resume_agent/preview?session_id=${session_id}`)
      const data = await res.json()
      const raw = data.result || ""
      const newSections: Record<string, string> = {}
      SECTIONS.forEach((section) => {
        const regex = new RegExp(`## ${section}[\\s\\S]*?(?=##|$)`, "i")
        const match = raw.match(regex)
        newSections[section] = match ? match[0].replace(`## ${section}`, "").trim() : ""
      })
      setSections(newSections)
    } catch (err) {
      toast({ title: "Failed", description: "Could not fetch sections", variant: "destructive" })
    }
  }

  useEffect(() => {
    if (isOpen) fetchSections()
  }, [isOpen])

  const handleSave = async () => {
    try {
      const updatedSections: Record<string, string> = {}

      for (const section of SECTIONS) {
        const res = await fetch(`http://localhost:8000/mcp/tools/update_section`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id, section, content: sections[section] }),
        })
        const data = await res.json()
        // Extract updated section content from returned final_resume
        updatedSections[section] = sections[section]
      }

      toast({ title: "Saved", description: "Resume updated successfully." })
      onSave(updatedSections) // pass updated sections to preview
      onClose()
    } catch (err) {
      toast({ title: "Error", description: "Failed to save updates", variant: "destructive" })
    }
  }

  const scrollToSection = (section: string) => {
    const el = document.getElementById(`section-${section}`)
    if (el && scrollRef.current) scrollRef.current.scrollTo({ top: el.offsetTop, behavior: "smooth" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full flex flex-col p-4" style={{ maxHeight: "90vh" }}>
        <DialogHeader>
          <DialogTitle>Edit Resume</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r pr-2 flex-shrink-0">
            <h3 className="font-semibold mb-2">Sections</h3>
            {SECTIONS.map((s) => (
              <Button key={s} variant="ghost" size="sm" className="w-full text-left mb-1" onClick={() => scrollToSection(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            {SECTIONS.map((section) => (
              <div key={section} id={`section-${section}`} className="mb-6">
                <h4 className="font-semibold capitalize mb-1">{section}</h4>
                <Textarea
                  value={sections[section] || ""}
                  onChange={(e) => setSections({ ...sections, [section]: e.target.value })}
                  rows={6}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-end mt-4 gap-2">
          <Button variant="secondary" onClick={onClose}>Discard</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ResumeEditor
