import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles, Search, Loader2, Trash2, Clock, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProjects, useDeleteProject } from "@/hooks/useProjects";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  generating: { label: "Gerando", variant: "default" },
  ready: { label: "Pronto", variant: "outline" },
  error: { label: "Erro", variant: "destructive" },
};

export default function Projects() {
  const [search, setSearch] = useState("");
  const { data: projects, isLoading, error } = useProjects();
  const deleteProject = useDeleteProject();

  const filteredProjects = projects?.filter((project) =>
    project.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;
    
    try {
      await deleteProject.mutateAsync(id);
      toast.success("Projeto excluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir projeto");
    }
  };

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Projetos</h1>
            <p className="mt-2 text-muted-foreground">
              Gerencie todos os seus sites criados com IA
            </p>
          </div>
          <Link to="/new">
            <Button variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              Novo Projeto
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card variant="glass" className="p-12 text-center">
            <p className="text-destructive">Erro ao carregar projetos</p>
          </Card>
        )}

        {/* Projects list */}
        {!isLoading && !error && filteredProjects && filteredProjects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Link key={project.id} to={`/preview/${project.id}`}>
                <Card variant="interactive" className="group h-full">
                  <CardContent className="p-0">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-muted/50 flex items-center justify-center border-b border-border">
                      <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-heading font-semibold truncate">
                            {project.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {project.description || "Sem descrição"}
                          </p>
                        </div>
                        <Badge variant={statusLabels[project.status]?.variant || "secondary"}>
                          {statusLabels[project.status]?.label || project.status}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(project.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(project.id, project.name);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredProjects?.length === 0 && (
          <Card variant="glass" className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-heading text-lg font-semibold">
              {search ? "Nenhum projeto encontrado" : "Nenhum projeto ainda"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
              {search
                ? "Tente buscar por outro termo"
                : "Comece criando seu primeiro projeto. A IA vai te ajudar em cada passo."}
            </p>
            {!search && (
              <Link to="/new" className="mt-6 inline-block">
                <Button variant="hero">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Projeto
                </Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
