import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Clock,
  GitBranch,
  Check,
  RotateCcw,
  Eye,
} from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LayoutTree } from "@/types/layout-tree";

interface LayoutVersion {
  id: string;
  project_id: string;
  layout_tree: LayoutTree;
  version_number: number;
  commit_message: string | null;
  created_by: string | null;
  is_current: boolean;
  created_at: string;
}

export default function Versions() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: projectLoading } = useProject(projectId);

  const { data: versions, isLoading: versionsLoading } = useQuery({
    queryKey: ["versions", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("layout_versions")
        .select("*")
        .eq("project_id", projectId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      return data as unknown as LayoutVersion[];
    },
    enabled: !!projectId,
  });

  const isLoading = projectLoading || versionsLoading;

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
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link to={`/preview/${projectId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-3xl font-bold">
              Histórico de Versões
            </h1>
            <p className="mt-1 text-muted-foreground">{project.name}</p>
          </div>
        </div>

        {/* Versions List */}
        {versions && versions.length > 0 ? (
          <div className="space-y-4">
            {versions.map((version, index) => (
              <Card
                key={version.id}
                variant={version.is_current ? "interactive" : "glass"}
                className={version.is_current ? "ring-2 ring-primary" : ""}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <GitBranch className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold">
                        Versão {version.version_number}
                      </h3>
                      {version.is_current && (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          Atual
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {version.commit_message || "Sem descrição"}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(version.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver
                    </Button>
                    {!version.is_current && (
                      <Button variant="ghost" size="sm">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restaurar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card variant="glass" className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <GitBranch className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold">
              Nenhuma versão salva
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
              As versões serão salvas automaticamente quando você fizer
              alterações no layout através do VibeChat.
            </p>
            <Link to={`/vibe/${projectId}`} className="mt-6 inline-block">
              <Button variant="hero">Abrir VibeChat</Button>
            </Link>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
