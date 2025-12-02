import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Copy,
  Loader2,
  Sparkles,
  Check,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { useProjectFiles } from "@/hooks/useProjectFiles";
import { TemplateSelector } from "@/components/page-multiplier/TemplateSelector";
import { TagsDetector } from "@/components/page-multiplier/TagsDetector";
import { VariationsTable } from "@/components/page-multiplier/VariationsTable";
import { GenerationConfig } from "@/components/page-multiplier/GenerationConfig";
import { TemplatePreview } from "@/components/page-multiplier/TemplatePreview";
import {
  detectTags,
  generatePageContent,
  generateFileName,
} from "@/hooks/usePageTemplates";
import { TemplateVariation, GeneratedPage } from "@/types/page-templates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function PageMultiplier() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: files, isLoading: filesLoading } = useProjectFiles(projectId);
  const queryClient = useQueryClient();

  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [variations, setVariations] = useState<TemplateVariation[]>([]);
  const [outputPattern, setOutputPattern] = useState("{slug}.html");
  const [outputFolder, setOutputFolder] = useState("pages");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedPages, setGeneratedPages] = useState<GeneratedPage[]>([]);

  // Get selected file content
  const selectedFile = useMemo(
    () => files?.find((f) => f.file_path === selectedFilePath),
    [files, selectedFilePath]
  );

  // Auto-detect tags when template changes
  useEffect(() => {
    if (selectedFile?.content) {
      const detected = detectTags(selectedFile.content);
      setTags(detected);
      
      // Update output pattern with first tag
      if (detected.length > 0) {
        const baseName = selectedFile.file_name.replace(".html", "");
        setOutputPattern(`${baseName}-{${detected[0]}}.html`);
      }
    } else {
      setTags([]);
    }
  }, [selectedFile]);

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    // Also remove from variations
    setVariations(
      variations.map((v) => {
        const { [tag]: _, ...rest } = v;
        return rest;
      })
    );
  };

  const canGenerate = useMemo(() => {
    return (
      selectedFile &&
      tags.length > 0 &&
      variations.length > 0 &&
      variations.every((v) => tags.every((t) => v[t]?.trim()))
    );
  }, [selectedFile, tags, variations]);

  const handleGenerate = async () => {
    if (!canGenerate || !projectId || !selectedFile) return;

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedPages([]);

    try {
      const pages: GeneratedPage[] = [];
      const total = variations.length;

      for (let i = 0; i < variations.length; i++) {
        const variation = variations[i];
        const content = generatePageContent(selectedFile.content, variation);
        const fileName = generateFileName(outputPattern, variation);
        const filePath = outputFolder
          ? `${outputFolder}/${fileName}`
          : fileName;

        pages.push({ fileName, filePath, content });

        // Save to database
        const { error } = await supabase.from("project_files").upsert(
          {
            project_id: projectId,
            file_path: filePath,
            file_name: fileName,
            file_type: "html",
            content,
          },
          { onConflict: "project_id,file_path" }
        );

        if (error) throw error;

        setGenerationProgress(Math.round(((i + 1) / total) * 100));
      }

      setGeneratedPages(pages);
      queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
      toast.success(`${pages.length} página(s) gerada(s) com sucesso!`);
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Erro ao gerar páginas");
    } finally {
      setIsGenerating(false);
    }
  };

  if (projectLoading || filesLoading) {
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
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Projeto não encontrado</p>
          <Link to="/projects">
            <Button variant="outline">Voltar aos Projetos</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const hasFiles = files && files.length > 0;

  return (
    <AppLayout>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-border bg-background px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={`/vibe/${projectId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading text-xl font-semibold">
                  Page Multiplier
                </h1>
                <p className="text-sm text-muted-foreground">
                  {project.name} - Gere múltiplas páginas a partir de um template
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                {variations.length} página{variations.length !== 1 ? "s" : ""} para gerar
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="container max-w-4xl py-6 space-y-6">
            {!hasFiles ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-heading font-semibold">
                    Nenhum arquivo no projeto
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground text-center">
                    Primeiro gere os arquivos do site no VibeChat
                  </p>
                  <Link to={`/vibe/${projectId}`} className="mt-4">
                    <Button>Ir para VibeChat</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Step 1: Select Template */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        1
                      </span>
                      Selecionar Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TemplateSelector
                      files={files}
                      selectedFile={selectedFilePath}
                      onSelect={setSelectedFilePath}
                    />
                    {selectedFile && (
                      <TemplatePreview
                        content={selectedFile.content}
                        tags={tags}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Step 2: Tags */}
                {selectedFilePath && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          2
                        </span>
                        Configurar Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TagsDetector
                        tags={tags}
                        onAddTag={handleAddTag}
                        onRemoveTag={handleRemoveTag}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Variations */}
                {tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          3
                        </span>
                        Definir Variações
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VariationsTable
                        tags={tags}
                        variations={variations}
                        onChange={setVariations}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Output Config */}
                {variations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          4
                        </span>
                        Configurar Saída
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <GenerationConfig
                        outputPattern={outputPattern}
                        outputFolder={outputFolder}
                        onPatternChange={setOutputPattern}
                        onFolderChange={setOutputFolder}
                        tags={tags}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Generate Button */}
                {variations.length > 0 && (
                  <Card>
                    <CardContent className="py-6">
                      {isGenerating ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span>Gerando páginas...</span>
                            <span>{generationProgress}%</span>
                          </div>
                          <Progress value={generationProgress} />
                        </div>
                      ) : generatedPages.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-green-600">
                            <Check className="h-5 w-5" />
                            <span className="font-medium">
                              {generatedPages.length} página(s) gerada(s)!
                            </span>
                          </div>
                          <div className="rounded-lg border border-border bg-muted/30 p-4">
                            <p className="text-sm font-medium mb-2">
                              Arquivos criados:
                            </p>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {generatedPages.slice(0, 5).map((page) => (
                                <li key={page.filePath}>• {page.filePath}</li>
                              ))}
                              {generatedPages.length > 5 && (
                                <li>... e mais {generatedPages.length - 5}</li>
                              )}
                            </ul>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setGeneratedPages([])}
                            >
                              Gerar Mais
                            </Button>
                            <Link to={`/vibe/${projectId}`}>
                              <Button>Ver Arquivos</Button>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleGenerate}
                          disabled={!canGenerate}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Gerar {variations.length} Página
                          {variations.length !== 1 ? "s" : ""}
                        </Button>
                      )}

                      {!canGenerate && !isGenerating && generatedPages.length === 0 && (
                        <p className="mt-2 text-center text-sm text-muted-foreground">
                          Preencha todas as variações para habilitar a geração
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
