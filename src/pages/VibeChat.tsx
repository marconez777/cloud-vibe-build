import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Send,
  Loader2,
  Eye,
  Sparkles,
  Bot,
  User,
  RefreshCw,
} from "lucide-react";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import { LayoutRenderer } from "@/components/preview/LayoutRenderer";
import type { LayoutTree, ChatMessage } from "@/types/layout-tree";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function VibeChat() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);
  const updateProject = useUpdateProject();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentLayout, setCurrentLayout] = useState<LayoutTree | null>(null);

  // Initialize messages and layout when project loads
  useEffect(() => {
    if (project) {
      setCurrentLayout(project.layout_tree as unknown as LayoutTree | null);
      
      if (messages.length === 0) {
        const initialMessage: ChatMessage = {
          id: "1",
          role: "assistant",
          content: project.layout_tree
            ? "Layout carregado! Descreva as alterações que deseja fazer no site."
            : `Olá! Vou criar o layout para "${project.name}". ${project.description ? `\n\nBriefing: ${project.description}\n\nClique em "Gerar Layout" para começar ou descreva alterações no briefing.` : "Descreva como você quer que o site seja."}`,
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
      }
    }
  }, [project]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateLayout = async (userMessage?: string) => {
    if (isGenerating) return;

    setIsGenerating(true);

    // Add user message if provided
    if (userMessage) {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    // Add thinking message
    const thinkingMsg: ChatMessage = {
      id: `thinking-${Date.now()}`,
      role: "assistant",
      content: "Gerando layout com IA...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, thinkingMsg]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-layout", {
        body: {
          projectId,
          briefing: project?.description || userMessage,
          messages: userMessage
            ? messages
                .filter((m) => m.id !== "1")
                .map((m) => ({ role: m.role, content: m.content }))
                .concat([{ role: "user", content: userMessage }])
            : undefined,
        },
      });

      if (error) throw error;

      // Remove thinking message
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("thinking")));

      if (data.layoutTree) {
        setCurrentLayout(data.layoutTree);
        
        // Invalidate project query to refresh data
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        queryClient.invalidateQueries({ queryKey: ["projects"] });

        const successMsg: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Layout gerado com sucesso! O preview está atualizado à direita. Você pode pedir alterações a qualquer momento.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMsg]);
        toast.success("Layout gerado com sucesso!");
      } else {
        const responseMsg: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: data.message || "Não consegui gerar o layout. Por favor, tente novamente com mais detalhes.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, responseMsg]);
      }
    } catch (error) {
      console.error("Error generating layout:", error);
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("thinking")));
      
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Ocorreu um erro ao gerar o layout. Por favor, tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      toast.error("Erro ao gerar layout");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const message = input.trim();
    setInput("");
    await generateLayout(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Projeto não encontrado</p>
          <Link to="/projects">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar aos Projetos
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Chat Panel */}
        <div className="flex w-[400px] flex-col border-r border-border bg-background">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Link to={`/preview/${projectId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-sm">VibeChat</h2>
                <p className="text-xs text-muted-foreground">{project.name}</p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          {!currentLayout && (
            <div className="border-b border-border p-4">
              <Button
                variant="hero"
                className="w-full"
                onClick={() => generateLayout()}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Layout com IA
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      message.role === "assistant"
                        ? "bg-primary/10"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-4 py-2",
                      message.role === "assistant"
                        ? "bg-muted/50"
                        : "bg-primary text-primary-foreground",
                      message.id.startsWith("thinking") && "animate-pulse"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Descreva as mudanças que deseja..."
                className="min-h-[80px] resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="mt-2 flex justify-between">
              {currentLayout && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateLayout()}
                  disabled={isGenerating}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerar
                </Button>
              )}
              <Button
                variant="hero"
                size="sm"
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="ml-auto"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Enviar
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex-1 overflow-hidden bg-muted/30 p-4">
          <div className="h-full overflow-auto rounded-lg border border-border bg-white shadow-lg">
            {currentLayout ? (
              <LayoutRenderer layoutTree={currentLayout} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">
                    Preview aparecerá aqui
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Clique em "Gerar Layout com IA" para criar o site
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
