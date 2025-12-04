import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Settings,
} from "lucide-react";
import { ExportOptionsDialog, ExportOptions } from "@/components/export/ExportOptionsDialog";
import { useProject } from "@/hooks/useProjects";
import { useProjectFiles } from "@/hooks/useProjectFiles";
import { useChatMessages, useSaveChatMessage, useClearChatHistory } from "@/hooks/useChatMessages";
import { FileExplorer } from "@/components/file-explorer/FileExplorer";
import { ResponsivePreview } from "@/components/file-explorer/ResponsivePreview";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { EnhancedGenerationProgress } from "@/components/chat/EnhancedGenerationProgress";
import { useGenerationStatus } from "@/hooks/useGenerationStatus";
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
  const [activeTab, setActiveTab] = useState<"preview" | "files">("preview");
  const [previewPage, setPreviewPage] = useState<string>("index.html");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const {
    status: generationStatus,
    isGenerating,
    startGeneration,
    updateStage,
    completeGeneration,
    setError,
    reset: resetGeneration,
    checkTimeout,
  } = useGenerationStatus();

  const hasFiles = files && files.length > 0;

  // Active timeout checking during generation
  useEffect(() => {
    if (!isGenerating) return;
    
    const interval = setInterval(() => {
      checkTimeout();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isGenerating, checkTimeout]);

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
        const layoutTree = project?.layout_tree as { fromTheme?: string } | null;
        const isFromTemplate = hasFiles && !!layoutTree?.fromTheme;
        
        let welcomeContent: string;
        if (isFromTemplate) {
          welcomeContent = `Template carregado para "${project.name}"!\n\nClique em "Personalizar Template" para substituir os textos genéricos pelos dados do seu negócio.\n\nDepois da personalização, você pode editar via chat.`;
        } else if (hasFiles) {
          welcomeContent = "Arquivos carregados! Você pode editar via chat:\n\n• \"mude a cor primária para azul\"\n• \"adicione um formulário de contato\"\n• \"inclua uma seção de depoimentos\"";
        } else {
          welcomeContent = `Olá! Vou criar os arquivos do site para "${project.name}". ${project.description ? `\n\nBriefing: ${project.description}\n\nClique em "Gerar Site" ou descreva o que você quer.` : "Descreva como você quer que o site seja."}`;
        }
        
        const welcomeMsg: LocalMessage = {
          id: "welcome",
          role: "assistant",
          content: welcomeContent,
          timestamp: new Date(),
        };
        setLocalMessages([welcomeMsg]);
      }
      setInitialized(true);
    }
  }, [savedMessages, messagesLoading, project, hasFiles, initialized]);

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

  // Sequential pipeline - 3 independent calls
  const generateFilesSequential = async (userMessage?: string) => {
    if (isGenerating || !projectId) return;

    startGeneration();
    const isEditMode = hasFiles && !!userMessage;

    if (userMessage) {
      const userMsg: LocalMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };
      setLocalMessages((prev) => [...prev, userMsg]);
      
      saveMessage.mutate({
        projectId,
        role: "user",
        content: userMessage,
      });
    }

    try {
      // Fetch project settings first
      const { data: projectSettings } = await supabase
        .from("project_settings")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (isEditMode) {
        // EDIT MODE: Call generate-files directly (fast, single call)
        updateStage("code_generator", "Modificando arquivos...");
        
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
            currentFiles,
            editMode: true,
            userMessage,
          },
        });

        if (error) throw error;
        if (!data.success) throw new Error(data.error || "Erro na edição");

        await refetchFiles();
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        completeGeneration();

        const successContent = `${data.files?.length || 0} arquivo(s) atualizado(s)! Veja o preview ou explore os arquivos.`;
        const successMsg: LocalMessage = {
          id: `success-${Date.now()}`,
          role: "assistant",
          content: successContent,
          timestamp: new Date(),
        };
        setLocalMessages((prev) => [...prev, successMsg]);
        saveMessage.mutate({ projectId, role: "assistant", content: successContent });
        toast.success("Arquivos atualizados!");

      } else {
        // Check if project was created from a template
        const layoutTree = project?.layout_tree as { fromTheme?: string } | null;
        const isFromTemplate = hasFiles && !!layoutTree?.fromTheme;

        if (isFromTemplate) {
          // TEMPLATE PERSONALIZATION MODE: 2 stages (faster, preserves structure)
          const briefing = project?.description || userMessage || "";
          
          const currentFiles = files?.map((f) => ({
            path: f.file_path,
            name: f.file_name,
            type: f.file_type,
            content: f.content,
          }));

          // Stage 1: Personalize Template
          updateStage("personalizing", "Personalizando textos do template...");
          console.log("Template Mode - Stage 1: Calling personalize-template...");
          
          const { data: personalized, error: personalizeError } = await supabase.functions.invoke("personalize-template", {
            body: { files: currentFiles, projectSettings, briefing },
          });

          if (personalizeError) {
            console.error("Personalize error:", personalizeError);
            throw new Error(`Personalização falhou: ${personalizeError.message}`);
          }

          let finalFiles = personalized?.files || currentFiles;
          console.log("Personalization complete. Files:", finalFiles.length);

          // Stage 2: Update Metadata
          updateStage("metadata", "Atualizando metadados SEO...");
          console.log("Template Mode - Stage 2: Calling update-metadata...");
          
          try {
            const { data: metadataData, error: metadataError } = await supabase.functions.invoke("update-metadata", {
              body: { files: finalFiles, projectSettings },
            });

            if (!metadataError && metadataData?.success && metadataData?.files) {
              finalFiles = metadataData.files;
              console.log("Metadata update complete");
            } else {
              console.warn("Metadata update did not apply");
            }
          } catch (metadataErr) {
            console.warn("Metadata update failed, using personalized files:", metadataErr);
          }

          // Stage 3: Save to database
          updateStage("saving", "Salvando arquivos...");
          console.log("Template Mode - Stage 3: Saving files...");

          await supabase.from("project_files").delete().eq("project_id", projectId);

          const filesToInsert = finalFiles.map((file: any) => ({
            project_id: projectId,
            file_path: file.path,
            file_name: file.name,
            file_type: file.type,
            content: file.content,
          }));

          const { error: insertError } = await supabase
            .from("project_files")
            .insert(filesToInsert);

          if (insertError) {
            console.error("Database insert error:", insertError);
            throw insertError;
          }

          await supabase
            .from("projects")
            .update({ status: "ready", updated_at: new Date().toISOString() })
            .eq("id", projectId);

          await refetchFiles();
          queryClient.invalidateQueries({ queryKey: ["project", projectId] });
          completeGeneration();

          const successContent = `Template personalizado com sucesso!\n\n📁 ${finalFiles.length} arquivo(s) atualizados\n\nOs textos e metadados foram adaptados para o seu negócio.`;
          
          const successMsg: LocalMessage = {
            id: `success-${Date.now()}`,
            role: "assistant",
            content: successContent,
            timestamp: new Date(),
          };
          setLocalMessages((prev) => [...prev, successMsg]);
          saveMessage.mutate({ projectId, role: "assistant", content: successContent });
          toast.success("Template personalizado!");

        } else {
          // GENERATION MODE: Sequential pipeline (3 independent calls)
          const briefing = project?.description || userMessage || "";

        // Stage 1: Design Analyst
        updateStage("design_analyst", "Design Analyst analisando...");
        console.log("Stage 1: Calling analyze-design...");
        
        const { data: designData, error: designError } = await supabase.functions.invoke("analyze-design", {
          body: { briefing, referenceImages: [] },
        });

        if (designError) {
          console.error("Design Analyst error:", designError);
          throw new Error(`Design Analyst falhou: ${designError.message}`);
        }

        const designSpecs = designData?.designSpecs;
        console.log("Design specs received:", !!designSpecs);

        // Stage 2: Code Generator
        updateStage("code_generator", "Code Generator criando HTML/CSS/JS...");
        console.log("Stage 2: Calling generate-code...");

        const { data: codeData, error: codeError } = await supabase.functions.invoke("generate-code", {
          body: { briefing, designSpecs, projectSettings },
        });

        if (codeError) {
          console.error("Code Generator error:", codeError);
          throw new Error(`Code Generator falhou: ${codeError.message}`);
        }

        if (!codeData?.success || !codeData?.files) {
          throw new Error(codeData?.error || "Code Generator não retornou arquivos");
        }

        let generatedFiles = codeData.files;
        console.log("Files generated:", generatedFiles.length);

        // Stage 3: SEO Specialist
        updateStage("seo_specialist", "SEO Specialist otimizando...");
        console.log("Stage 3: Calling optimize-seo...");

        let seoApplied = false;
        try {
          const { data: seoData, error: seoError } = await supabase.functions.invoke("optimize-seo", {
            body: { files: generatedFiles, businessInfo: projectSettings },
          });

          if (!seoError && seoData?.success && seoData?.files) {
            generatedFiles = seoData.files;
            seoApplied = true;
            console.log("SEO optimizations applied");
          } else {
            console.warn("SEO Specialist did not apply optimizations");
          }
        } catch (seoErr) {
          console.warn("SEO Specialist failed, using unoptimized files:", seoErr);
        }

        // Stage 4: Generate SEO auxiliary files
        const customFields = projectSettings?.custom_fields as Record<string, any> | null;
        const siteUrl = customFields?.seo?.canonical_url || "https://www.seusite.com.br";
        const companyName = projectSettings?.company_name || "Site";
        
        const robotsContent = `# robots.txt for ${companyName}
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay (optional, for politeness)
Crawl-delay: 1`;

        generatedFiles.push({
          path: "robots.txt",
          name: "robots.txt",
          type: "txt",
          content: robotsContent,
        });

        const htmlFiles = generatedFiles.filter((f: any) => f.type === "html");
        const today = new Date().toISOString().split("T")[0];
        
        let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;
        
        htmlFiles.forEach((file: any) => {
          const pagePath = file.path === "index.html" ? "" : file.path.replace(".html", "");
          const priority = file.path === "index.html" ? "1.0" : "0.8";
          const changefreq = file.path === "index.html" ? "weekly" : "monthly";
          
          sitemapContent += `  <url>
    <loc>${siteUrl}/${pagePath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
        });
        
        sitemapContent += `</urlset>`;
        
        generatedFiles.push({
          path: "sitemap.xml",
          name: "sitemap.xml",
          type: "xml",
          content: sitemapContent,
        });

        // Stage 5: Save to database
        updateStage("saving", "Salvando arquivos...");
        console.log("Stage 4: Saving files to database...");

        await supabase.from("project_files").delete().eq("project_id", projectId);

        const filesToInsert = generatedFiles.map((file: any) => ({
          project_id: projectId,
          file_path: file.path,
          file_name: file.name,
          file_type: file.type,
          content: file.content,
        }));

        const { error: insertError } = await supabase
          .from("project_files")
          .insert(filesToInsert);

        if (insertError) {
          console.error("Database insert error:", insertError);
          throw insertError;
        }

        await supabase
          .from("projects")
          .update({ status: "ready", updated_at: new Date().toISOString() })
          .eq("id", projectId);

        await refetchFiles();
        queryClient.invalidateQueries({ queryKey: ["project", projectId] });
        completeGeneration();

        if (!seoApplied) {
          toast.warning("SEO não foi aplicado. Tente regenerar o site.", { duration: 5000 });
        }

        const successContent = `Site gerado com sucesso!\n\n📁 Estrutura:\n• index.html (HTML + CSS + JS inline)\n• robots.txt\n• sitemap.xml\n\nExplore os arquivos ou continue editando via chat.${!seoApplied ? "\n\n⚠️ Otimização SEO não foi aplicada." : ""}`;

        const successMsg: LocalMessage = {
          id: `success-${Date.now()}`,
          role: "assistant",
          content: successContent,
          timestamp: new Date(),
        };
        setLocalMessages((prev) => [...prev, successMsg]);
        saveMessage.mutate({ projectId, role: "assistant", content: successContent });
        toast.success("Site gerado com sucesso!");
        }
      }
    } catch (error) {
      console.error("Error generating files:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);

      const errorContent = `Erro: ${errorMessage}. Por favor, tente novamente.`;
      const errorMsg: LocalMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      };
      setLocalMessages((prev) => [...prev, errorMsg]);
      toast.error("Erro ao processar");
      
      globalThis.setTimeout(() => resetGeneration(), 5000);
    }
  };

  // Alias for backward compatibility
  const generateFiles = generateFilesSequential;

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

  const handleExportZip = async (options: ExportOptions) => {
    if (!hasFiles) return;

    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("export-zip", {
        body: {
          projectId,
          projectName: project?.name,
          projectDescription: project?.description,
          options,
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

        setExportDialogOpen(false);
        toast.success(`ZIP exportado com ${data.filesCount} arquivos!`);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao exportar ZIP");
    } finally {
      setIsExporting(false);
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

          {/* Generate/Personalize Button */}
          {(() => {
            const layoutTree = project?.layout_tree as { fromTheme?: string } | null;
            const isFromTemplate = !!layoutTree?.fromTheme;
            
            // Show button if: no files OR template project that can be personalized
            if (!hasFiles || isFromTemplate) {
              return (
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
                        {isFromTemplate ? "Personalizando..." : "Gerando..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isFromTemplate ? "Personalizar Template" : "Gerar Site com IA"}
                      </>
                    )}
                  </Button>
                </div>
              );
            }
            return null;
          })()}

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
                <EnhancedGenerationProgress 
                  stage={generationStatus.stage}
                  message={generationStatus.message}
                  progress={generationStatus.progress}
                  error={generationStatus.error}
                  startTime={generationStatus.startTime}
                />
              )}
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

            <div className="flex gap-2">
              <Link to={`/settings/${projectId}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Personalizar
                </Button>
              </Link>
              {hasFiles && (
                <>
                  <Link to={`/page-multiplier/${projectId}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Copy className="h-4 w-4" />
                      Multiplicar
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)} className="gap-2">
                    <Download className="h-4 w-4" />
                    ZIP
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-hidden bg-muted/30 p-4">
          {activeTab === "preview" ? (
              hasFiles ? (
                <ResponsivePreview 
                  files={files} 
                  currentPage={previewPage}
                  onPageChange={setPreviewPage}
                />
              ) : (
                <div className="h-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
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
                </div>
              )
            ) : (
              <div className="h-full rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                {hasFiles ? (
                  <FileExplorer 
                    projectId={projectId!}
                    previewPage={previewPage}
                    onPreviewPage={(path) => {
                      setPreviewPage(path);
                      setActiveTab("preview");
                    }}
                  />
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

      {/* Export Dialog */}
      <ExportOptionsDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExportZip}
        isExporting={isExporting}
        projectName={project.name}
        filesCount={files?.length || 0}
      />
    </AppLayout>
  );
}
