import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Send,
  Loader2,
  Eye,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  Download,
  Code,
  FolderTree,
} from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { useProjectFiles, useDeleteProjectFiles } from "@/hooks/useProjectFiles";
import { FileExplorer } from "@/components/file-explorer/FileExplorer";
import { FilePreview } from "@/components/file-explorer/FilePreview";
import type { ChatMessage } from "@/types/layout-tree";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function VibeChat() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);
  const { data: files, refetch: refetchFiles } = useProjectFiles(projectId);
  const deleteFiles = useDeleteProjectFiles();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "files">("preview");
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasFiles = files && files.length > 0;

  // Initialize messages when project loads
  useEffect(() => {
    if (project && messages.length === 0) {
      const initialMessage: ChatMessage = {
        id: "1",
        role: "assistant",
        content: hasFiles
          ? "Arquivos carregados! Você pode:\n\n• \"mude a cor primária para azul\"\n• \"adicione um menu dropdown no header\"\n• \"altere o título principal para X\"\n• \"adicione uma seção de depoimentos\"\n• \"torne o site mais moderno\""
          : `Olá! Vou criar os arquivos do site para "${project.name}". ${project.description ? `\n\nBriefing: ${project.description}\n\nClique em "Gerar Site" para começar.` : "Descreva como você quer que o site seja e clique em Gerar."}`,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [project, hasFiles]);

  // Update initial message when files load
  useEffect(() => {
    if (hasFiles && messages.length === 1 && messages[0].id === "1") {
      setMessages([{
        id: "1",
        role: "assistant",
        content: "Arquivos carregados! Você pode editar via chat:\n\n• \"mude a cor primária para azul\"\n• \"adicione um menu dropdown no header\"\n• \"altere o título principal para X\"\n• \"adicione uma seção de depoimentos\"",
        timestamp: new Date(),
      }]);
    }
  }, [hasFiles]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateFiles = async (userMessage?: string) => {
    if (isGenerating) return;

    setIsGenerating(true);
    const isEditMode = hasFiles && !!userMessage;

    if (userMessage) {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    const thinkingMsg: ChatMessage = {
      id: `thinking-${Date.now()}`,
      role: "assistant",
      content: isEditMode ? "Modificando arquivos..." : "Gerando arquivos do site...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, thinkingMsg]);

    try {
      const currentFiles = files?.map((f) => ({
        path: f.file_path,
        name: f.file_name,
        type: f.file_type,
        content: f.content,
      }));

      const { data, error } = await supabase.functions.invoke("generate-files", {
        body: {
          projectId,
          briefing: project?.description || userMessage,
          currentFiles: isEditMode ? currentFiles : undefined,
          editMode: isEditMode,
          userMessage: userMessage,
        },
      });

      if (error) throw error;

      setMessages((prev) => prev.filter((m) => !m.id.startsWith("thinking")));

      if (data.success) {
        await refetchFiles();
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });

        const successMsg: ChatMessage = {
          id: Date.now().toString(),
          role: "assistant",
          content: isEditMode
            ? `${data.files?.length || 0} arquivo(s) atualizado(s)! Veja o preview ou explore os arquivos na aba "Arquivos".`
            : `Site gerado com ${data.files?.length || 0} arquivo(s)!\n\n📁 Estrutura:\n• index.html\n• css/ (estilos)\n• components/ (header, footer)\n• js/ (scripts)\n\nExplore os arquivos ou continue editando via chat.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMsg]);
        toast.success(isEditMode ? "Arquivos atualizados!" : "Site gerado com sucesso!");
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Error generating files:", error);
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("thinking")));

      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Ocorreu um erro ao processar. Por favor, tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      toast.error("Erro ao processar");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const message = input.trim();
    setInput("");
    await generateFiles(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExportZip = async () => {
    if (!hasFiles) return;

    try {
      toast.info("Gerando arquivo ZIP...");

      const { data, error } = await supabase.functions.invoke("export-zip", {
        body: {
          projectId,
          projectName: project?.name,
        },
      });

      if (error) throw error;

      if (data.success && data.zipData) {
        // Convert base64 to blob
        const byteCharacters = atob(data.zipData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/zip" });

        // Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("ZIP exportado com sucesso!");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar ZIP");
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
        <div className="flex w-[350px] flex-col border-r border-border bg-background">
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
          {!hasFiles && (
            <div className="border-b border-border p-4">
              <Button
                variant="hero"
                className="w-full"
                onClick={() => generateFiles()}
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
                    Gerar Site com IA
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
                      "max-w-[85%] rounded-xl px-4 py-2",
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
            <Textarea
              placeholder="Descreva as mudanças..."
              className="min-h-[60px] resize-none text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="mt-2 flex justify-between">
              {hasFiles && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateFiles()}
                  disabled={isGenerating}
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
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
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  <Send className="mr-2 h-3 w-3" />
                )}
                Enviar
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview & Files */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tabs Header */}
          <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "files")}>
              <TabsList>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2">
                  <FolderTree className="h-4 w-4" />
                  Arquivos
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {hasFiles && (
              <Button variant="outline" size="sm" onClick={handleExportZip} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar ZIP
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden bg-muted/30 p-4">
            {activeTab === "preview" ? (
              <div className="h-full rounded-lg border border-border bg-white shadow-lg overflow-hidden">
                {hasFiles ? (
                  <FilePreview files={files} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <Eye className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">Preview aparecerá aqui</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Clique em "Gerar Site com IA" para criar os arquivos
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                {hasFiles ? (
                  <FileExplorer projectId={projectId!} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <Code className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">Arquivos aparecerão aqui</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Gere o site para ver a estrutura de arquivos
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
