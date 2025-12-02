import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  FolderOpen,
  Clock,
  Sparkles,
  ArrowRight,
  Code2,
  Loader2,
} from "lucide-react";
import { useProjects, useProjectsStats } from "@/hooks/useProjects";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const quickActions = [
  {
    title: "Novo Projeto",
    description: "Comece do zero com um briefing",
    icon: Plus,
    href: "/new",
    primary: true,
  },
  {
    title: "Ver Projetos",
    description: "Continue trabalhando em projetos existentes",
    icon: FolderOpen,
    href: "/projects",
    primary: false,
  },
];

export default function Dashboard() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: stats, isLoading: statsLoading } = useProjectsStats();

  const recentProjects = projects?.slice(0, 3);
  const isLoading = projectsLoading || statsLoading;

  const statsData = [
    { label: "Projetos Criados", value: stats?.totalProjects ?? 0, icon: FolderOpen },
    { label: "Versões Salvas", value: stats?.totalVersions ?? 0, icon: Clock },
    { label: "Linhas de Código", value: stats?.totalLines ?? 0, icon: Code2 },
  ];

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Bem-vindo ao PHPVibe. Crie sites incríveis com IA.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {statsData.map((stat) => (
            <Card key={stat.label} variant="glass">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-2xl font-bold">{stat.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-semibold">Ações Rápidas</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link key={action.href} to={action.href}>
                <Card
                  variant="interactive"
                  className="h-full"
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                        action.primary ? "gradient-primary" : "bg-muted"
                      }`}
                    >
                      <action.icon
                        className={`h-7 w-7 ${
                          action.primary ? "text-primary-foreground" : "text-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent projects */}
        <div>
          <h2 className="mb-4 font-heading text-xl font-semibold">Projetos Recentes</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentProjects && recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link key={project.id} to={`/preview/${project.id}`}>
                  <Card variant="interactive">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <FolderOpen className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold truncate">
                          {project.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(project.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
              <Link to="/projects" className="block">
                <Button variant="ghost" className="w-full">
                  Ver todos os projetos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <Card variant="glass" className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold">
                Nenhum projeto ainda
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                Crie seu primeiro projeto e comece a construir sites incríveis com a ajuda da IA.
              </p>
              <Link to="/new" className="mt-6 inline-block">
                <Button variant="hero">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Projeto
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
