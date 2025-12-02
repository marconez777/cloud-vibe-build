import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Sparkles, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Projects() {
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
            />
          </div>
        </div>

        {/* Empty state */}
        <Card variant="glass" className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-heading text-lg font-semibold">
            Nenhum projeto encontrado
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
            Comece criando seu primeiro projeto. A IA vai te ajudar em cada passo.
          </p>
          <Link to="/new" className="mt-6 inline-block">
            <Button variant="hero">
              <Plus className="mr-2 h-4 w-4" />
              Criar Projeto
            </Button>
          </Link>
        </Card>
      </div>
    </AppLayout>
  );
}
