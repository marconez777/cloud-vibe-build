import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Brain,
  Upload,
  FileText,
  Trash2,
  Plus,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Memory {
  id: string;
  title: string;
  content: string;
  type: 'instruction' | 'example' | 'context';
  createdAt: Date;
}

export default function Knowledge() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showForm, setShowForm] = useState(false);

  const addMemory = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    const memory: Memory = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      type: 'instruction',
      createdAt: new Date(),
    };

    setMemories([...memories, memory]);
    setNewTitle("");
    setNewContent("");
    setShowForm(false);
    toast.success("Memória adicionada!");
  };

  const deleteMemory = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
    toast.success("Memória removida");
  };

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Base de Conhecimento</h1>
            <p className="mt-2 text-muted-foreground">
              Treine a IA com informações específicas do seu negócio
            </p>
          </div>
          <Button variant="hero" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Memória
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add memory form */}
            {showForm && (
              <Card variant="glass" className="animate-slide-up">
                <CardHeader>
                  <CardTitle className="text-base">Nova Memória</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      placeholder="Ex: Padrão de cores da empresa"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdo</Label>
                    <Textarea
                      placeholder="Descreva a informação que a IA deve lembrar..."
                      className="min-h-[120px]"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="hero" onClick={addMemory}>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                    <Button variant="ghost" onClick={() => setShowForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File upload */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Upload className="h-4 w-4 text-primary" />
                  Upload de Arquivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-8 transition-colors hover:border-primary/50 cursor-pointer">
                  <div className="text-center">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium">
                      Arraste arquivos ou clique para upload
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, TXT, MD, DOCX até 10MB cada
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memories list */}
            {memories.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-heading font-semibold">Memórias Salvas</h3>
                {memories.map((memory) => (
                  <Card key={memory.id} variant="glass" className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium">{memory.title}</h4>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {memory.content}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMemory(memory.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              !showForm && (
                <Card variant="glass" className="p-8 text-center">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 font-heading font-semibold">
                    Nenhuma memória ainda
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Adicione informações para a IA aprender sobre seu negócio
                  </p>
                </Card>
              )
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Como funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  A base de conhecimento permite que você treine a IA com informações específicas.
                </p>
                <p>
                  Adicione instruções, exemplos de código, padrões de design, ou qualquer informação
                  que a IA deva considerar ao gerar seus sites.
                </p>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">Sugestões</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Padrões de cores preferidos</li>
                  <li>• Estrutura de seções comum</li>
                  <li>• Textos padrão (footer, about)</li>
                  <li>• Exemplos de sites que você gosta</li>
                  <li>• Regras de negócio específicas</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
