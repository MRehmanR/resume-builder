import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ResumeData {
  name?: string
  title?: string
  email?: string
  phone?: string
  address?: string
  linkedin?: string
  github?: string
  nationality?: string
  dateOfBirth?: string
  gender?: string
  summary?: string
  skills?: string
  experience?: string
  education?: string
  projects?: string
  achievements?: string
  languages?: string
}

interface EuropassFormatProps {
  resume: ResumeData
}

export const EuropassFormat = ({ resume }: EuropassFormatProps) => {
  return (
    <div className="flex w-full bg-white text-gray-800" style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Left sidebar */}
      <div className="w-[30%] bg-gray-100 p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">{resume.name || "—"}</h1>
          <p className="text-sm text-gray-700">{resume.title || ""}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase">Contact</h2>
          <p>Email: {resume.email || "—"}</p>
          <p>Phone: {resume.phone || "—"}</p>
          {resume.linkedin && <p>LinkedIn: {resume.linkedin}</p>}
          {resume.github && <p>GitHub: {resume.github}</p>}
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase">Personal Info</h2>
          {resume.address && <p>Address: {resume.address}</p>}
          {resume.nationality && <p>Nationality: {resume.nationality}</p>}
          {resume.dateOfBirth && <p>DOB: {resume.dateOfBirth}</p>}
          {resume.gender && <p>Gender: {resume.gender}</p>}
        </div>
        {resume.languages && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase">Languages</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.languages}</ReactMarkdown>
          </div>
        )}
        {resume.skills && (
          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase">Skills</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.skills}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Right main content */}
      <div className="w-[70%] p-6 space-y-6">
        {resume.summary && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">Profile</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.summary}</ReactMarkdown>
          </section>
        )}

        {resume.experience && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">Work Experience</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.experience}</ReactMarkdown>
          </section>
        )}

        {resume.education && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">Education & Training</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.education}</ReactMarkdown>
          </section>
        )}

        {resume.projects && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">Projects</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.projects}</ReactMarkdown>
          </section>
        )}

        {resume.achievements && (
          <section>
            <h2 className="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2">Achievements</h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.achievements}</ReactMarkdown>
          </section>
        )}
      </div>
    </div>
  )
}
