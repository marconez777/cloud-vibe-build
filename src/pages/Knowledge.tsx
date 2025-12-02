import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Upload,
  Trash2,
  Plus,
  Save,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Filter,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAIMemories,
  useCreateMemory,
  useDeleteMemory,
  useToggleMemory,
  useUpdateMemory,
  MEMORY_CATEGORIES,
  AIMemory,
} from "@/hooks/useAIMemories";
import { DocumentUpload } from "@/components/DocumentUpload";

export default function Knowledge() {
  const { data: memories, isLoading } = useAIMemories();
  const createMemory = useCreateMemory();
  const deleteMemory = useDeleteMemory();
  const toggleMemory = useToggleMemory();
  const updateMemory = useUpdateMemory();

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  
  const [editingMemory, setEditingMemory] = useState<AIMemory | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("general");

  const startEditing = (memory: AIMemory) => {
    setEditingMemory(memory);
    setEditTitle(memory.title);
    setEditContent(memory.content);
    setEditCategory(memory.category || "general");
  };

  const cancelEditing = () => {
    setEditingMemory(null);
    setEditTitle("");
    setEditContent("");
    setEditCategory("general");
  };

  const handleUpdateMemory = async () => {
    if (!editingMemory || !editTitle.trim() || !editContent.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await updateMemory.mutateAsync({
        id: editingMemory.id,
        title: editTitle,
        content: editContent,
        category: editCategory,
      });
      cancelEditing();
      toast.success("Memória atualizada!");
    } catch {
      toast.error("Erro ao atualizar memória");
    }
  };

  const handleAddMemory = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await createMemory.mutateAsync({
        title: newTitle,
        content: newContent,
        type: "instruction",
        category: newCategory,
      });
      setNewTitle("");
      setNewContent("");
      setNewCategory("general");
      setShowForm(false);
      toast.success("Memória adicionada!");
    } catch {
      toast.error("Erro ao adicionar memória");
    }
  };

  const filteredMemories = memories?.filter(
    (m) => filterCategory === "all" || m.category === filterCategory
  );

  const getCategoryLabel = (category: string) => {
    return MEMORY_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory.mutateAsync(id);
      toast.success("Memória removida");
    } catch {
      toast.error("Erro ao remover memória");
    }
  };

  const handleToggleMemory = async (id: string, isActive: boolean) => {
    try {
      await toggleMemory.mutateAsync({ id, is_active: !isActive });
      toast.success(isActive ? "Memória desativada" : "Memória ativada");
    } catch {
      toast.error("Erro ao atualizar memória");
    }
  };

  const activeCount = memories?.filter((m) => m.is_active).length || 0;

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
          <div className="flex items-center gap-4">
            {activeCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {activeCount} memória(s) ativa(s)
              </div>
            )}
            <Button variant="hero" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Memória
            </Button>
          </div>
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
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEMORY_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="hero"
                      onClick={handleAddMemory}
                      disabled={createMemory.isPending}
                    >
                      {createMemory.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
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
                <DocumentUpload
                  onDocumentUploaded={async (doc) => {
                    try {
                      await createMemory.mutateAsync({
                        title: `Documento: ${doc.name}`,
                        content: doc.content || `Arquivo carregado: ${doc.url}`,
                        type: "document",
                        category: "content",
                      });
                      toast.success(`Documento "${doc.name}" adicionado à base de conhecimento`);
                    } catch {
                      toast.error("Erro ao salvar documento");
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Memories list */}
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : memories && memories.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold">Memórias Salvas</h3>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {MEMORY_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {filteredMemories?.map((memory) => (
                  <Card
                    key={memory.id}
                    variant="glass"
                    className={`animate-fade-in ${!memory.is_active ? "opacity-60" : ""}`}
                  >
                    <CardContent className="p-4">
                      {editingMemory?.id === memory.id ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Título</Label>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Conteúdo</Label>
                            <Textarea
                              className="min-h-[100px]"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={editCategory} onValueChange={setEditCategory}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MEMORY_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="hero"
                              onClick={handleUpdateMemory}
                              disabled={updateMemory.isPending}
                            >
                              {updateMemory.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="mr-2 h-4 w-4" />
                              )}
                              Salvar
                            </Button>
                            <Button variant="ghost" onClick={cancelEditing}>
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium">{memory.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(memory.category)}
                              </Badge>
                              {memory.is_active ? (
                                <span className="flex items-center gap-1 text-xs text-green-500">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Ativa
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <XCircle className="h-3 w-3" />
                                  Inativa
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {memory.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(memory)}
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Switch
                              checked={memory.is_active}
                              onCheckedChange={() =>
                                handleToggleMemory(memory.id, memory.is_active)
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMemory(memory.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
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
                  As memórias <strong>ativas</strong> são incluídas automaticamente quando a IA gera ou edita seu site.
                </p>
                <p>
                  Use o toggle para ativar/desativar memórias sem precisar deletá-las.
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

            <Card variant="glass" className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2 text-primary">Dica Pro</h4>
                <p className="text-xs text-muted-foreground">
                  Adicione instruções como "Sempre use o tom formal" ou "Inclua botão de WhatsApp em todos os sites" para personalizar automaticamente todas as gerações.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
