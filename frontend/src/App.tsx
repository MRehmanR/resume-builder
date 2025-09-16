import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import ResumePreview from "./pages/ResumePreview"
import ManualEditor from "./pages/ManualEditor";
import JDParser from "./pages/JDParser";
import GapDetection from "./pages/GapDetection";
import ATSScoring from "./pages/ATSScoring";
import Collaboration from "./pages/Collaboration";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/ResumePreview" element={<ResumePreview />} />
          <Route path="/manual_editor" element={<ManualEditor />} />
          <Route path="/jd_parser" element={<JDParser />} />
          <Route path="/gap_detection" element={<GapDetection />} />
          <Route path="/ats_scoring" element={<ATSScoring />} />
          <Route path="/collaboration" element={<Collaboration />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
