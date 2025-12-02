import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  FolderOpen,
  Clock,
  Sparkles,
  ArrowRight,
  Code2,
  MessageSquare,
} from "lucide-react";

const stats = [
  { label: "Projetos Criados", value: "0", icon: FolderOpen },
  { label: "Versões Salvas", value: "0", icon: Clock },
  { label: "Linhas de Código", value: "0", icon: Code2 },
];

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
          {stats.map((stat) => (
            <Card key={stat.label} variant="glass">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
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

        {/* Empty state for recent projects */}
        <div>
          <h2 className="mb-4 font-heading text-xl font-semibold">Projetos Recentes</h2>
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
        </div>
      </div>
    </AppLayout>
  );
}
