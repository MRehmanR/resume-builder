import { useState, useRef, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Download, Eye, Upload, User, Bot } from "lucide-react";

interface ChatBotProps {
  onBack: () => void;
  onPreviewResume: (resumeData: any) => void;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
}

const DEFAULT_SESSION = "default_session";

const ChatBot = ({ onBack, onPreviewResume }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI resume assistant. I'll help you create a professional resume through our conversation. Let's start with your basic information. What's your full name?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: { name: "", email: "", phone: "", location: "", summary: "" },
    experience: [],
    education: [],
    skills: [],
  });
  const [currentStep, setCurrentStep] = useState("name");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const simulateTyping = async (response: string) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));
    setIsTyping(false);
    addMessage(response, false);
  };

  const callResumeAgent = async (userInput: string, sessionId: string = DEFAULT_SESSION) => {
    try {
const res = await axiosInstance.post("/mcp/tools/resume_agent", { query: userInput, session_id: sessionId });
      return res.data.result || "";
    } catch (error) {
      console.error("Error calling resume_agent:", error);
      return "Sorry, something went wrong. Please try again.";
    }
  };

  const fetchResumePreview = async (sessionId: string = DEFAULT_SESSION) => {
    try {
const res = await axiosInstance.get("/mcp/tools/resume_agent/preview", { params: { session_id: sessionId } });
      return res.data.result || "";
    } catch (error) {
      console.error("Error fetching resume preview:", error);
      return "";
    }
  };

  const processUserInput = async (userInput: string) => {
    addMessage(userInput, true);
    setInput("");

    const backendResponse = await callResumeAgent(userInput, DEFAULT_SESSION);

    const previewText = await fetchResumePreview(DEFAULT_SESSION);

    let newResumeData = { ...resumeData };


    switch (currentStep) {
      case "name":
        newResumeData.personalInfo.name = userInput;
        setCurrentStep("email");
        break;
      case "email":
        newResumeData.personalInfo.email = userInput;
        setCurrentStep("phone");
        break;
      case "phone":
        newResumeData.personalInfo.phone = userInput;
        setCurrentStep("location");
        break;
      case "location":
        newResumeData.personalInfo.location = userInput;
        setCurrentStep("summary");
        break;
      case "summary":
        newResumeData.personalInfo.summary = userInput;
        setCurrentStep("experience");
        break;
      case "experience":
        if (userInput.toLowerCase() !== "done") {
          const expParts = userInput.split(" at ");
          if (expParts.length >= 2) {
            newResumeData.experience.push({
              title: expParts[0],
              company: expParts[1].split(" from ")[0] || expParts[1],
              duration: userInput.includes(" from ") ? userInput.split(" from ")[1] : "Present",
              description: userInput,
            });
          }
        }
        if (userInput.toLowerCase() === "done" || newResumeData.experience.length >= 2) {
          setCurrentStep("education");
        }
        break;
      case "education":
        if (userInput.toLowerCase() !== "done") {
          const eduParts = userInput.split(" from ");
          if (eduParts.length >= 2) {
            newResumeData.education.push({
              degree: eduParts[0],
              school: eduParts[1].split(" in ")[0] || eduParts[1],
              year: userInput.includes(" in ") ? userInput.split(" in ")[1] : "Recent",
            });
          }
        }
        setCurrentStep("skills");
        break;
      case "skills":
        newResumeData.skills = userInput.split(",").map((skill) => skill.trim());
        setCurrentStep("complete");
        break;
      case "complete":
        break;
      default:
        break;
    }

    setResumeData(newResumeData);
    await simulateTyping(backendResponse || "Got it! Let's continue...");
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await processUserInput(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addMessage(`I've uploaded my resume: ${file.name}`, true);
      simulateTyping("Great! I can see your uploaded resume. I'll help you update and improve it. What specific changes would you like to make?");
    }
  };

  const handleDownload = () => {
    addMessage("Please download my resume as PDF", true);
    simulateTyping("I'm generating your PDF resume now! In a real implementation, this would trigger a PDF download with your resume data.");
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Button variant="outline" onClick={onBack} className="btn-responsive flex items-center space-x-2 order-1 sm:order-none">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex flex-wrap gap-2 order-2 sm:order-none w-full sm:w-auto">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx" className="hidden" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="btn-responsive flex items-center space-x-2 hover:border-primary flex-1 sm:flex-none">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Resume</span>
              <span className="sm:hidden">Upload</span>
            </Button>

            {(resumeData.personalInfo.name || currentStep !== "name") && (
              <Button variant="outline" onClick={() => onPreviewResume(resumeData)} className="btn-responsive flex items-center space-x-2 hover:border-primary">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview Resume</span>
                <span className="sm:hidden">Preview</span>
              </Button>
            )}

            {currentStep === "complete" && (
              <Button variant="default" onClick={handleDownload} className="btn-responsive flex items-center space-x-2 bg-gradient-primary hover:opacity-90">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">Download</span>
              </Button>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <Card className="mb-6 p-3 sm:p-6 min-h-[400px] sm:min-h-[500px] max-h-[500px] sm:max-h-[600px] overflow-y-auto glass-strong">
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[80%] ${message.isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.isUser ? "bg-gradient-primary shadow-soft" : "bg-secondary shadow-soft"}`}>
                    {message.isUser ? <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />}
                  </div>
                  <div className={`rounded-2xl p-3 sm:p-4 shadow-soft ${message.isUser ? "bg-gradient-primary text-white" : "bg-white text-gray-800 border border-gray-100"}`}>
                    <p className="text-xs sm:text-sm leading-relaxed">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 sm:mt-2 block">{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-2xl p-4">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Input Area */}
        <Card className="p-3 sm:p-4 glass-strong">
          <div className="flex gap-2 sm:gap-4">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="w-full p-2 sm:p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base transition-all duration-200"
                rows={window.innerWidth < 640 ? 1 : 2}
                disabled={isTyping}
              />
            </div>
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} className="btn-responsive self-end bg-gradient-primary hover:opacity-90 px-3 sm:px-4">
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Press Enter to send • Shift + Enter for new line</span>
            <span className="sm:hidden">Tap to send</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatBot;
