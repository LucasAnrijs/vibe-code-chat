
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Curriculum from "./pages/Curriculum";
import GitHubEditor from "./pages/GitHubEditor";
import AgentBuilder from "./pages/AgentBuilder";
import PromptDesigner from "./pages/PromptDesigner";
import NotFound from "./pages/NotFound";
import LearningProgress from "@/components/LearningProgress";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/github-editor" element={<GitHubEditor />} />
          <Route path="/progress" element={<LearningProgress />} />
          <Route path="/agent-builder" element={<AgentBuilder />} />
          <Route path="/prompt-designer" element={<PromptDesigner />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
