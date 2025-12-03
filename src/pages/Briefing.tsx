import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useCreateProject } from "@/hooks/useProjects";
import { ImageUpload } from "@/components/ImageUpload";
import { ThemeSelector } from "@/components/themes/ThemeSelector";
import { useCopyThemeToProject } from "@/hooks/useThemes";

const examples = [
  "Site para clínica odontológica com hero, serviços, depoimentos e contato. Cores azul e branco.",
  "Landing page para escritório de advocacia. Profissional, sério, com áreas de atuação e equipe.",
  "Site de academia com preços, galeria de fotos, horários e formulário de matrícula.",
];

export default function Briefing() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [briefing, setBriefing] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const createProject = useCreateProject();
  const copyThemeToProject = useCopyThemeToProject();

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

    try {
      // Include reference images in the description if any
      let fullDescription = briefing.trim();
      if (referenceImages.length > 0) {
        fullDescription += `\n\n[Imagens de referência: ${referenceImages.join(", ")}]`;
      }

      const project = await createProject.mutateAsync({
        name: name.trim(),
        description: fullDescription,
        status: "draft",
      });

      // If a theme was selected, copy its files to the project
      if (selectedThemeId) {
        try {
          await copyThemeToProject.mutateAsync({
            themeId: selectedThemeId,
            projectId: project.id,
          });
          toast.success("Projeto criado com tema base!");
        } catch (themeError) {
          console.error("Error copying theme files:", themeError);
          toast.warning("Projeto criado, mas houve erro ao copiar o tema.");
        }
      } else {
        toast.success("Projeto criado com sucesso!");
      }
      
      navigate(`/vibe/${project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Erro ao criar projeto. Tente novamente.");
    }
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

                  {/* Theme Selection */}
                  <div className="space-y-2 p-4 rounded-lg bg-muted/30 border border-border/50">
                    <ThemeSelector
                      selectedThemeId={selectedThemeId}
                      onSelect={setSelectedThemeId}
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
                    <ImageUpload
                      onImagesChange={setReferenceImages}
                      maxFiles={5}
                      maxSize={10}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={createProject.isPending || copyThemeToProject.isPending}
                  >
                    {createProject.isPending || copyThemeToProject.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Criando...
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
                  <li>• Adicione imagens de sites que você gosta</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
