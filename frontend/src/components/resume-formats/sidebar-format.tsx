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

interface SidebarFormatProps {
  resume: ResumeData
}

export const SidebarFormat = ({ resume }: SidebarFormatProps) => {
  return (
    <div className="max-w-6xl mx-auto bg-white flex min-h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-slate-800 text-white p-6 space-y-6">
        {/* Profile */}
        <div className="text-center">
          <div className="w-24 h-24 bg-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {resume.name ? resume.name[0] : "—"}
            </span>
          </div>
          <h1 className="text-xl font-bold">{resume.name || "—"}</h1>
          <p className="text-slate-300">{resume.title || "—"}</p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Contact</h3>
          <div className="space-y-2 text-sm">
            {resume.email && <p>📧 {resume.email}</p>}
            {resume.phone && <p>📱 {resume.phone}</p>}
            {resume.linkedin && <p>💼 LinkedIn: {resume.linkedin}</p>}
            {resume.github && <p>🌐 {resume.github}</p>}
          </div>
        </div>

        {/* Skills */}
        {resume.skills && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-300">Skills</h3>
            <div className="text-sm text-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.skills}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Education */}
        {resume.education && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-300">Education</h3>
            <div className="text-sm text-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.education}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Achievements */}
        {resume.achievements && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-blue-300">Achievements</h3>
            <div className="text-sm text-slate-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.achievements}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8">
        {/* Summary */}
        {resume.summary && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
              <div className="w-1 h-8 bg-blue-500 mr-3"></div>
              Professional Summary
            </h2>
            <div className="text-slate-700 leading-relaxed pl-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Experience */}
        {resume.experience && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
              <div className="w-1 h-8 bg-green-500 mr-3"></div>
              Professional Experience
            </h2>
            <div className="pl-4 space-y-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.experience}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Projects */}
        {resume.projects && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
              <div className="w-1 h-8 bg-purple-500 mr-3"></div>
              Projects
            </h2>
            <div className="pl-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.projects}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
