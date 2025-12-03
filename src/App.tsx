import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
import Themes from "./pages/Themes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/help" element={<Help />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/new" element={<ProtectedRoute><Briefing /></ProtectedRoute>} />
            <Route path="/knowledge" element={<ProtectedRoute><Knowledge /></ProtectedRoute>} />
            <Route path="/preview/:projectId" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
            <Route path="/vibe/:projectId" element={<ProtectedRoute><VibeChat /></ProtectedRoute>} />
            <Route path="/versions/:projectId" element={<ProtectedRoute><Versions /></ProtectedRoute>} />
            <Route path="/page-multiplier/:projectId" element={<ProtectedRoute><PageMultiplier /></ProtectedRoute>} />
            <Route path="/settings/:projectId" element={<ProtectedRoute><ProjectSettings /></ProtectedRoute>} />
            <Route path="/themes" element={<ProtectedRoute><Themes /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
