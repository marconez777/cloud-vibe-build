import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Code2,
  MessageSquare,
  History,
  Loader2,
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Download,
  RefreshCw,
  FolderTree,
} from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { useProjectFiles } from "@/hooks/useProjectFiles";
import { ResponsivePreview } from "@/components/file-explorer/ResponsivePreview";
import { FileExplorer } from "@/components/file-explorer/FileExplorer";
import { ExportOptionsDialog, ExportOptions } from "@/components/export/ExportOptionsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ViewMode = "desktop" | "tablet" | "mobile";

const viewModeWidths: Record<ViewMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export default function Preview() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);
  const { data: files, isLoading: filesLoading } = useProjectFiles(projectId);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [activeTab, setActiveTab] = useState("preview");
  const [previewPage, setPreviewPage] = useState<string>("index.html");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const hasFiles = files && files.length > 0;

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

  if (isLoading || filesLoading) {
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
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-4">
            <Link to="/projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading font-semibold">{project.name}</h1>
              <p className="text-xs text-muted-foreground">
                {project.status === "ready"
                  ? "Pronto para edição"
                  : project.status === "generating"
                  ? "Gerando..."
                  : "Rascunho"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
              <Button
                variant={viewMode === "desktop" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "tablet" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "mobile" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            {/* Actions */}
            <Link to={`/vibe/${projectId}`}>
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                VibeChat
              </Button>
            </Link>
            <Link to={`/versions/${projectId}`}>
              <Button variant="outline" size="sm">
                <History className="mr-2 h-4 w-4" />
                Versões
              </Button>
            </Link>
            <Button 
              variant="hero" 
              size="sm"
              onClick={() => setExportDialogOpen(true)}
              disabled={!hasFiles}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="border-b border-border px-4">
              <TabsList className="h-12">
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2">
                  <FolderTree className="h-4 w-4" />
                  Arquivos
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="h-[calc(100%-3rem)] m-0 p-4">
              <div
                className="mx-auto h-full overflow-hidden rounded-lg border border-border bg-white shadow-lg transition-all duration-300"
                style={{ maxWidth: viewModeWidths[viewMode] }}
              >
              {hasFiles ? (
                  <ResponsivePreview 
                    files={files}
                    currentPage={previewPage}
                    onPageChange={setPreviewPage}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <RefreshCw className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">
                        Site não gerado
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Use o VibeChat para gerar o site
                      </p>
                    </div>
                    <Link to={`/vibe/${projectId}`}>
                      <Button variant="hero">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Abrir VibeChat
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="files" className="h-[calc(100%-3rem)] m-0 p-4">
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
                      <Code2 className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">
                        Nenhum arquivo gerado
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Use o VibeChat para gerar os arquivos
                      </p>
                    </div>
                    <Link to={`/vibe/${projectId}`}>
                      <Button variant="hero">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Abrir VibeChat
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

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
