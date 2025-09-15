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

interface ExecutiveFormatProps {
  resume: ResumeData
}

export const ExecutiveFormat = ({ resume }: ExecutiveFormatProps) => {
  return (
    <div className="max-w-5xl mx-auto bg-white">
      {/* Elegant Header */}
      <div className="border-b-4 border-gray-900 pb-6 mb-8">
        <div className="flex justify-between items-end flex-wrap">
          <div>
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
              {resume.name || ""}
            </h1>
            <p className="text-xl text-gray-600 font-light">{resume.title || ""}</p>
          </div>
          <div className="text-right text-sm text-gray-600 space-y-1">
            {resume.email && <p>{resume.email}</p>}
            {resume.phone && <p>{resume.phone}</p>}
            {resume.linkedin && <p>LinkedIn: {resume.linkedin}</p>}
            {resume.github && <p>GitHub: {resume.github}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Sections */}
        {resume.summary && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Executive Summary
            </h2>
            <div className="text-gray-700 leading-relaxed text-justify border-l-4 border-gray-300 pl-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {resume.skills && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Core Competencies
            </h2>
            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.skills}</ReactMarkdown>
            </div>
          </div>
        )}

        {resume.experience && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Professional Experience
            </h2>
            <div className="space-y-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.experience}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Two-column layout for Education & Achievements */}
        <div className="grid md:grid-cols-2 gap-8">
          {resume.education && (
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider">
                Education & Certifications
              </h2>
              <div className="border-l-4 border-gray-300 pl-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.education}</ReactMarkdown>
              </div>
            </div>
          )}

          {resume.achievements && (
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider">
                Key Achievements
              </h2>
              <div className="border-l-4 border-gray-300 pl-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.achievements}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Projects */}
        {resume.projects && (
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 uppercase tracking-wider">
              Notable Projects & Initiatives
            </h2>
            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.projects}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>References available upon request</p>
      </div>
    </div>
  )
}
