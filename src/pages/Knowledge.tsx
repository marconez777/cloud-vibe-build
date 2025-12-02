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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Shield,
  Zap,
  Palette,
  Search as SearchIcon,
  LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSystemMemories,
  useUserMemories,
  useCreateMemory,
  useDeleteMemory,
  useToggleMemory,
  useUpdateMemory,
  MEMORY_CATEGORIES,
  AIMemory,
} from "@/hooks/useAIMemories";
import { DocumentUpload } from "@/components/DocumentUpload";

export default function Knowledge() {
  const { data: systemMemories, isLoading: loadingSystem } = useSystemMemories();
  const { data: userMemories, isLoading: loadingUser } = useUserMemories();
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

  const filteredUserMemories = userMemories?.filter(
    (m) => filterCategory === "all" || m.category === filterCategory
  );

  const getCategoryLabel = (category: string) => {
    return MEMORY_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "estrutura": return <SearchIcon className="h-4 w-4" />;
      case "estilo": return <Palette className="h-4 w-4" />;
      case "business": return <LayoutTemplate className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
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

  const activeSystemCount = systemMemories?.filter((m) => m.is_active).length || 0;
  const activeUserCount = userMemories?.filter((m) => m.is_active).length || 0;
  const totalActive = activeSystemCount + activeUserCount;

  const isLoading = loadingSystem || loadingUser;

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
            {totalActive > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {totalActive} memória(s) ativa(s)
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
            {/* System Memories Section */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-primary" />
                  Memórias do Sistema
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {activeSystemCount}/{systemMemories?.length || 0} ativas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSystem ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : systemMemories && systemMemories.length > 0 ? (
                  <Accordion type="multiple" className="space-y-2">
                    {systemMemories.map((memory) => (
                      <AccordionItem
                        key={memory.id}
                        value={memory.id}
                        className={`border rounded-lg px-4 ${!memory.is_active ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center justify-between py-2">
                          <AccordionTrigger className="flex-1 hover:no-underline py-2">
                            <div className="flex items-center gap-3 text-left">
                              {getCategoryIcon(memory.category)}
                              <div>
                                <span className="font-medium">{memory.title}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {getCategoryLabel(memory.category)}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <Switch
                            checked={memory.is_active}
                            onCheckedChange={() => handleToggleMemory(memory.id, memory.is_active)}
                            className="ml-4"
                          />
                        </div>
                        <AccordionContent className="pb-4">
                          <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                            {memory.content}
                          </pre>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma memória do sistema encontrada.</p>
                )}
              </CardContent>
            </Card>

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

            {/* User Memories list */}
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userMemories && userMemories.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold">Suas Memórias</h3>
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
                {filteredUserMemories?.map((memory) => (
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
                    Nenhuma memória personalizada
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Adicione informações específicas do seu negócio
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
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Memórias do Sistema:</p>
                  <p>
                    Pré-configuradas com melhores práticas de SEO, performance, design e templates.
                    Ative/desative conforme necessário.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Suas Memórias:</p>
                  <p>
                    Adicione informações personalizadas sobre seu negócio, preferências e padrões.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">O que incluir</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• Paleta de cores preferida</li>
                  <li>• Tipografia e fontes</li>
                  <li>• Tom de voz dos textos</li>
                  <li>• Informações da empresa</li>
                  <li>• Serviços oferecidos</li>
                  <li>• Diferenciais competitivos</li>
                </ul>
              </CardContent>
            </Card>

            <Card variant="glass" className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Dica Pro
                </h4>
                <p className="text-xs text-muted-foreground">
                  Mantenha as memórias do sistema ativas para garantir sites com SEO otimizado,
                  boa performance e design profissional automaticamente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
