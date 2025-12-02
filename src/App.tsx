import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Briefing from "./pages/Briefing";
import Knowledge from "./pages/Knowledge";
import Help from "./pages/Help";
import Preview from "./pages/Preview";
import VibeChat from "./pages/VibeChat";
import Versions from "./pages/Versions";
import PageMultiplier from "./pages/PageMultiplier";
import ProjectSettings from "./pages/ProjectSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/new" element={<Briefing />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/help" element={<Help />} />
          <Route path="/preview/:projectId" element={<Preview />} />
          <Route path="/vibe/:projectId" element={<VibeChat />} />
          <Route path="/versions/:projectId" element={<Versions />} />
          <Route path="/page-multiplier/:projectId" element={<PageMultiplier />} />
          <Route path="/settings/:projectId" element={<ProjectSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
