import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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

interface ATSFormatProps {
  resume: ResumeData
}

export const ATSFormat = ({ resume }: ATSFormatProps) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 space-y-6">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-900 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{resume.name || "—"}</h1>
        <p className="text-sm text-gray-500">
          {resume.email || "—"} {resume.phone ? `| ${resume.phone}` : ""}{" "}
          {resume.linkedin ? `| LinkedIn: ${resume.linkedin}` : ""}{" "}
          {resume.github ? `| GitHub: ${resume.github}` : ""}
        </p>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Professional Summary</h2>
          <div className="text-gray-700 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.summary}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Skills */}
      {resume.skills && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Technical Skills</h2>
          <div className="text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.skills}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Experience */}
      {resume.experience && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Professional Experience</h2>
          <div className="text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.experience}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Education</h2>
          <div className="text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.education}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Projects</h2>
          <div className="text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.projects}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Achievements */}
      {resume.achievements && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Achievements</h2>
          <div className="text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.achievements}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
