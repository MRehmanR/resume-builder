import React from "react"
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

interface CreativeFormatProps {
  resume: ResumeData
}

export const CreativeFormat = ({ resume }: CreativeFormatProps) => {
  return (
    <div className="max-w-4xl mx-auto bg-white relative overflow-hidden sm:p-4">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-200 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

      <div className="relative z-10 p-8 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-block text-center">
  <svg width="100%" height="60" viewBox="0 0 600 60" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="nameGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="48" fontWeight="bold" fill="url(#nameGradient)">
      {resume.name || "—"}
    </text>
  </svg>

            <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"></div>
          </div>
          <p className="text-xl text-gray-600 mt-4">{resume.title || ""}</p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500 flex-wrap">
            {resume.email && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                {resume.email}
              </span>
            )}
            {resume.phone && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                {resume.phone}
              </span>
            )}
            {resume.linkedin && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                LinkedIn: {resume.linkedin}
              </span>
            )}
            {resume.github && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                GitHub: {resume.github}
              </span>
            )}
          </div>
        </div>

        {/* Sections */}
        {["summary", "skills", "experience"].map((key) =>
          resume[key as keyof ResumeData] ? (
            <div key={key} className="mb-8">
              <div className="flex items-center mb-4">
                <div
                  className={`w-8 h-8 flex items-center justify-center mr-3 rounded-lg ${
                    key === "summary"
                      ? "bg-gradient-to-r from-pink-50 to-purple-50"
                      : key === "skills"
                      ? "bg-gradient-to-r from-blue-50 to-teal-50"
                      : "bg-gradient-to-r from-green-50 to-emerald-50"
                  }`}
                >
                  <span className="text-white text-sm font-bold">
                    {key === "summary" ? "💡" : key === "skills" ? "⚡" : "🚀"}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {key === "summary"
                    ? "About Me"
                    : key === "skills"
                    ? "Skills & Expertise"
                    : "Experience Journey"}
                </h2>
              </div>
              <div
                className={`p-6 rounded-2xl border-l-4 ${
                  key === "summary"
                    ? "border-pink-400 bg-gradient-to-r from-pink-50 to-purple-50"
                    : key === "skills"
                    ? "border-blue-400 bg-gradient-to-r from-blue-50 to-teal-50"
                    : "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {resume[key as keyof ResumeData]}
                </ReactMarkdown>
              </div>
            </div>
          ) : null
        )}

        {/* Grid for Education and Projects */}
        <div className="grid md:grid-cols-2 gap-6">
          {resume.education && (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">🎓</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Education</h2>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-l-4 border-orange-400">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {resume.education}
                </ReactMarkdown>
              </div>
            </div>
          )}
          {resume.projects && (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">🛠️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Projects</h2>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border-l-4 border-purple-400">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {resume.projects}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* Achievements */}
        {resume.achievements && (
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">🏆</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Achievements</h2>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border-l-4 border-yellow-400">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {resume.achievements}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
