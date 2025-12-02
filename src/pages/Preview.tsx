import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { LayoutRenderer } from "@/components/preview/LayoutRenderer";
import type { LayoutTree } from "@/types/layout-tree";

type ViewMode = "desktop" | "tablet" | "mobile";

const viewModeWidths: Record<ViewMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export default function Preview() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [activeTab, setActiveTab] = useState("preview");

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
            <Button variant="hero" size="sm">
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
                <TabsTrigger value="code" className="gap-2">
                  <Code2 className="h-4 w-4" />
                  Código
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="h-[calc(100%-3rem)] m-0 p-4">
              <div
                className="mx-auto h-full overflow-auto rounded-lg border border-border bg-white shadow-lg transition-all duration-300"
                style={{ maxWidth: viewModeWidths[viewMode] }}
              >
                {layoutTree ? (
                  <LayoutRenderer layoutTree={layoutTree} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <RefreshCw className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">
                        Layout não gerado
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Use o VibeChat para gerar o layout do seu site
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

            <TabsContent value="code" className="h-[calc(100%-3rem)] m-0 p-4">
              <Card variant="glass" className="h-full overflow-auto">
                <pre className="p-4 text-sm">
                  <code className="text-muted-foreground">
                    {layoutTree
                      ? JSON.stringify(layoutTree, null, 2)
                      : "// Layout não gerado ainda"}
                  </code>
                </pre>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
