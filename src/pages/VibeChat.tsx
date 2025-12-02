import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  Loader2,
  Eye,
  Sparkles,
  RefreshCw,
  Download,
  Code,
  FolderTree,
  Copy,
} from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { useProjectFiles, useDeleteProjectFiles } from "@/hooks/useProjectFiles";
import { useChatMessages, useSaveChatMessage, useClearChatHistory } from "@/hooks/useChatMessages";
import { FileExplorer } from "@/components/file-explorer/FileExplorer";
import { FilePreview } from "@/components/file-explorer/FilePreview";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { QuickSuggestions } from "@/components/chat/QuickSuggestions";
import { GenerationProgress } from "@/components/chat/GenerationProgress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isThinking?: boolean;
}

export default function VibeChat() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);
  const { data: files, refetch: refetchFiles } = useProjectFiles(projectId);
  const { data: savedMessages, isLoading: messagesLoading } = useChatMessages(projectId);
  const saveMessage = useSaveChatMessage();
  const clearHistory = useClearChatHistory();
  const queryClient = useQueryClient();
  
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "files">("preview");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  const hasFiles = files && files.length > 0;

  // Initialize messages from database
  useEffect(() => {
    if (!messagesLoading && savedMessages && !initialized) {
      if (savedMessages.length > 0) {
        setLocalMessages(
          savedMessages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            timestamp: new Date(m.created_at),
          }))
        );
      } else if (project) {
        // Add welcome message
        const welcomeMsg: LocalMessage = {
          id: "welcome",
          role: "assistant",
          content: hasFiles
            ? "Arquivos carregados! Você pode editar via chat:\n\n• \"mude a cor primária para azul\"\n• \"adicione um formulário de contato\"\n• \"inclua uma seção de depoimentos\""
            : `Olá! Vou criar os arquivos do site para "${project.name}". ${project.description ? `\n\nBriefing: ${project.description}\n\nClique em "Gerar Site" ou descreva o que você quer.` : "Descreva como você quer que o site seja."}`,
          timestamp: new Date(),
        };
        setLocalMessages([welcomeMsg]);
      }
      setInitialized(true);
    }
  }, [savedMessages, messagesLoading, project, hasFiles, initialized]);

  // Update welcome message when files load
  useEffect(() => {
    if (hasFiles && localMessages.length === 1 && localMessages[0].id === "welcome") {
      setLocalMessages([{
        id: "welcome",
        role: "assistant",
        content: "Arquivos carregados! Você pode editar via chat:\n\n• \"mude a cor primária para azul\"\n• \"adicione um formulário de contato\"\n• \"inclua uma seção de depoimentos\"",
        timestamp: new Date(),
      }]);
    }
  }, [hasFiles]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  const handleClearHistory = async () => {
    if (!projectId) return;
    try {
      await clearHistory.mutateAsync(projectId);
      setLocalMessages([]);
      setInitialized(false);
      toast.success("Histórico limpo");
    } catch {
      toast.error("Erro ao limpar histórico");
    }
  };

  const generateFiles = async (userMessage?: string) => {
    if (isGenerating || !projectId) return;

    setIsGenerating(true);
    const isEditMode = hasFiles && !!userMessage;

    if (userMessage) {
      const userMsg: LocalMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };
      setLocalMessages((prev) => [...prev, userMsg]);
      
      // Save user message to database
      saveMessage.mutate({
        projectId,
        role: "user",
        content: userMessage,
      });
    }

    const thinkingMsg: LocalMessage = {
      id: `thinking-${Date.now()}`,
      role: "assistant",
      content: isEditMode ? "Modificando arquivos..." : "Gerando arquivos do site...",
      timestamp: new Date(),
      isThinking: true,
    };
    setLocalMessages((prev) => [...prev, thinkingMsg]);

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

      setLocalMessages((prev) => prev.filter((m) => !m.id.startsWith("thinking")));

      if (data.success) {
        await refetchFiles();
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });

        const successContent = isEditMode
          ? `${data.files?.length || 0} arquivo(s) atualizado(s)! Veja o preview ou explore os arquivos.`
          : `Site gerado com ${data.files?.length || 0} arquivo(s)!\n\n📁 Estrutura:\n• index.html\n• css/ (estilos)\n• components/ (header, footer)\n• js/ (scripts)\n\nExplore os arquivos ou continue editando via chat.`;

        const successMsg: LocalMessage = {
          id: `success-${Date.now()}`,
          role: "assistant",
          content: successContent,
          timestamp: new Date(),
        };
        setLocalMessages((prev) => [...prev, successMsg]);
        
        // Save assistant message to database
        saveMessage.mutate({
          projectId,
          role: "assistant",
          content: successContent,
        });

        toast.success(isEditMode ? "Arquivos atualizados!" : "Site gerado com sucesso!");
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Error generating files:", error);
      setLocalMessages((prev) => prev.filter((m) => !m.id.startsWith("thinking")));

      const errorContent = "Ocorreu um erro ao processar. Por favor, tente novamente.";
      const errorMsg: LocalMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      };
      setLocalMessages((prev) => [...prev, errorMsg]);
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

  const handleSuggestionSelect = (suggestion: string) => {
    if (hasFiles) {
      generateFiles(suggestion);
    } else {
      setInput(suggestion);
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
        const byteCharacters = atob(data.zipData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/zip" });

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

  if (isLoading || messagesLoading) {
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
            <Button variant="outline">Voltar aos Projetos</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Chat Panel */}
        <div className="flex w-[380px] flex-col border-r border-border bg-background">
          <ChatHeader
            projectId={projectId!}
            projectName={project.name}
            isGenerating={isGenerating}
            messageCount={localMessages.filter((m) => m.id !== "welcome").length}
            onClearHistory={handleClearHistory}
          />

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
              {localMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  isThinking={message.isThinking}
                />
              ))}
              
              {isGenerating && (
                <GenerationProgress isGenerating={isGenerating} editMode={hasFiles} />
              )}
            </div>
          </ScrollArea>

          {/* Quick Suggestions */}
          <div className="border-t border-border p-3">
            <QuickSuggestions
              hasFiles={hasFiles}
              onSelect={handleSuggestionSelect}
              disabled={isGenerating}
            />
          </div>

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
              <div className="flex gap-2">
                <Link to={`/page-multiplier/${projectId}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="h-4 w-4" />
                    Multiplicar Páginas
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleExportZip} className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar ZIP
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-hidden bg-muted/30 p-4">
            {activeTab === "preview" ? (
              <div className="h-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
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
