import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Upload, Lightbulb } from "lucide-react";
import { toast } from "sonner";

const examples = [
  "Site para clínica odontológica com hero, serviços, depoimentos e contato. Cores azul e branco.",
  "Landing page para escritório de advocacia. Profissional, sério, com áreas de atuação e equipe.",
  "Site de academia com preços, galeria de fotos, horários e formulário de matrícula.",
];

export default function Briefing() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [briefing, setBriefing] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Digite um nome para o projeto");
      return;
    }

    if (!briefing.trim()) {
      toast.error("Descreva o site que deseja criar");
      return;
    }

    setIsLoading(true);
    
    // For now, simulate and redirect to preview
    // TODO: Integrate with Supabase when Cloud is enabled
    toast.success("Projeto criado! Redirecionando...");
    setTimeout(() => {
      navigate("/projects");
    }, 1500);
  };

  const useExample = (example: string) => {
    setBriefing(example);
    toast.success("Exemplo aplicado!");
  };

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Novo Projeto</h1>
          <p className="mt-2 text-muted-foreground">
            Descreva o site que você quer criar e a IA fará o resto
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Briefing do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Projeto</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Site Clínica Dr. Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="briefing">Descrição do Site</Label>
                    <Textarea
                      id="briefing"
                      placeholder="Descreva o site que você deseja criar. Inclua informações sobre o tipo de negócio, seções desejadas, cores, estilo..."
                      className="min-h-[200px] resize-none"
                      value={briefing}
                      onChange={(e) => setBriefing(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Quanto mais detalhes você fornecer, melhor será o resultado.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Imagens de Referência (opcional)</Label>
                    <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 transition-colors hover:border-primary/50">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          Arraste imagens ou clique para upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG até 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar Site com IA
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Examples sidebar */}
          <div>
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Exemplos de Briefing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => useExample(example)}
                    className="w-full rounded-lg bg-muted/50 p-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {example}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card variant="glass" className="mt-4">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">Dicas</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Mencione o tipo de negócio</li>
                  <li>• Liste as seções desejadas</li>
                  <li>• Especifique cores preferidas</li>
                  <li>• Descreva o tom (formal, descontraído...)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
