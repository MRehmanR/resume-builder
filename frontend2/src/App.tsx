import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ChatBot from "./components/ChatBot";
import ResumePreview from "./components/ResumePreview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type AppState = 'landing' | 'chat' | 'preview';

const App = () => {
  const [currentView, setCurrentView] = useState<AppState>('landing');
  const [resumeData, setResumeData] = useState<any>(null);

  const handleGetStarted = () => {
    setCurrentView('chat');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handlePreviewResume = (data: any) => {
    setResumeData(data);
    setCurrentView('preview');
  };

  const handleBackToChat = () => {
    setCurrentView('chat');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'chat':
        return <ChatBot onBack={handleBackToLanding} onPreviewResume={handlePreviewResume} />;
      case 'preview':
        return <ResumePreview onBack={handleBackToChat} onEdit={handleBackToChat} resumeData={resumeData} />;
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={renderCurrentView()} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
