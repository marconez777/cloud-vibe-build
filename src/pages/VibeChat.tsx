import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { LayoutRenderer } from "@/components/preview/LayoutRenderer";
import type { LayoutTree, ChatMessage } from "@/types/layout-tree";
import { cn } from "@/lib/utils";

export default function VibeChat() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Sou seu assistente de design. Descreva como você quer que o site seja e eu vou criar o layout para você. Você pode pedir mudanças a qualquer momento!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    // Simulate AI response (will be replaced with actual AI call)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Entendi! Estou preparando o layout do seu site. Em breve você poderá visualizar e fazer ajustes. (Esta é uma resposta simulada - a integração com IA será implementada na próxima fase)",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 1500);
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

  const layoutTree = project.layout_tree as unknown as LayoutTree | null;

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
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Pensando...
                    </span>
                  </div>
                </div>
              )}
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
            <div className="mt-2 flex justify-end">
              <Button
                variant="hero"
                size="sm"
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
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
            {layoutTree ? (
              <LayoutRenderer layoutTree={layoutTree} />
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
                    Descreva o site que você quer e veja as mudanças em tempo
                    real
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
