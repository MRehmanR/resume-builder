import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Edit, Mail, Phone, MapPin, Calendar, Building } from "lucide-react";

interface ResumePreviewProps {
  onBack: () => void;
  onEdit: () => void;
  resumeData: any;
}

const ResumePreview = ({ onBack, onEdit, resumeData }: ResumePreviewProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDownloading(false);

    // In a real app, this would generate and download a PDF
    const element = document.createElement('a');
    const file = new Blob(['Resume PDF content would be here'], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = `${resumeData.personalInfo.name || 'Resume'}.pdf`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="btn-responsive flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Chat</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onEdit}
              className="btn-responsive flex items-center space-x-2 flex-1 sm:flex-none hover:border-primary"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Resume</span>
              <span className="sm:hidden">Edit</span>
            </Button>

            <Button
              variant="default"
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-responsive flex items-center space-x-2 bg-gradient-primary hover:opacity-90 flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
              <span className="sm:hidden">{isDownloading ? 'Generating...' : 'Download'}</span>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Resume Preview */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden bg-white shadow-large">
              {/* Resume Content */}
              <div className="p-8" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {/* Header */}
                <div className="border-b-2 border-gray-200 pb-6 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {resumeData.personalInfo.name || 'Your Name'}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    {resumeData.personalInfo.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>{resumeData.personalInfo.email}</span>
                      </div>
                    )}
                    {resumeData.personalInfo.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{resumeData.personalInfo.phone}</span>
                      </div>
                    )}
                    {resumeData.personalInfo.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{resumeData.personalInfo.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                {resumeData.personalInfo.summary && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                      Professional Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {resumeData.personalInfo.summary}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience && resumeData.experience.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                      Professional Experience
                    </h2>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp: any, index: number) => (
                        <div key={index}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                              <div className="flex items-center space-x-1 text-gray-600">
                                <Building className="w-4 h-4" />
                                <span>{exp.company}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{exp.duration}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resumeData.education && resumeData.education.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                      Education
                    </h2>
                    <div className="space-y-3">
                      {resumeData.education.map((edu: any, index: number) => (
                        <div key={index} className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                            <p className="text-gray-600">{edu.school}</p>
                          </div>
                          <span className="text-gray-600">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills && resumeData.skills.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                      Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Progress */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resume Completion</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Personal Info</span>
                  <span className="text-sm font-medium text-green-600">
                    {resumeData.personalInfo.name ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Experience</span>
                  <span className="text-sm font-medium text-green-600">
                    {resumeData.experience?.length > 0 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Education</span>
                  <span className="text-sm font-medium text-green-600">
                    {resumeData.education?.length > 0 ? '✓' : '○'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Skills</span>
                  <span className="text-sm font-medium text-green-600">
                    {resumeData.skills?.length > 0 ? '✓' : '○'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tips for Your Resume</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Keep your resume to 1-2 pages maximum</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Use action verbs to describe your achievements</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Quantify your accomplishments with numbers</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Tailor your resume for each job application</span>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onEdit}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Content
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;