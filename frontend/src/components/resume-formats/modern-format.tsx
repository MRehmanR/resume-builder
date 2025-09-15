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

interface ModernFormatProps {
  resume: ResumeData
}

export const ModernFormat = ({ resume }: ModernFormatProps) => {
  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <h1 className="text-3xl font-bold mb-2">{resume.name || ""}</h1>
        <p className="text-xl mb-4">{resume.title || ""}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          {resume.email && <span>📧 {resume.email}</span>}
          {resume.phone && <span>📱 {resume.phone}</span>}
          {resume.linkedin && <span>💼 LinkedIn: {resume.linkedin}</span>}
          {resume.github && <span>💻 GitHub: {resume.github}</span>}
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Professional Summary */}
        {resume.summary && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
              Professional Summary
            </h2>
            <div className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Technical Skills */}
        {resume.skills && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-500">
              Technical Skills
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.skills}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Professional Experience */}
        {resume.experience && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-500">
              Professional Experience
            </h2>
            <div className="space-y-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.experience}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Two-column layout: Education & Projects */}
        <div className="grid md:grid-cols-2 gap-8">
          {resume.education && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-orange-500">
                Education
              </h2>
              <div className="bg-orange-50 p-4 rounded-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.education}</ReactMarkdown>
              </div>
            </div>
          )}

          {resume.projects && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-teal-500">
                Projects
              </h2>
              <div className="bg-teal-50 p-4 rounded-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.projects}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Achievements */}
        {resume.achievements && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-red-500">
              Achievements
            </h2>
            <div className="bg-red-50 p-4 rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{resume.achievements}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
