import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Loader2,
  CheckCircle2,
  XCircle,
  Pencil,
  X,
  Palette,
  Code,
  Share2,
  ArrowRight,
  Sparkles,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAIMemories,
  useCreateMemory,
  useDeleteMemory,
  useToggleMemory,
  useUpdateMemory,
  MEMORY_CATEGORIES,
  AGENT_INFO,
  AIMemory,
  AgentType,
} from "@/hooks/useAIMemories";
import { DocumentUpload } from "@/components/DocumentUpload";
import { AgentManager } from "@/components/knowledge/AgentManager";

export default function Knowledge() {
  const { data: allMemories, isLoading } = useAIMemories();
  const createMemory = useCreateMemory();
  const deleteMemory = useDeleteMemory();
  const toggleMemory = useToggleMemory();
  const updateMemory = useUpdateMemory();

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newAgent, setNewAgent] = useState<AgentType>("all");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("design_analyst");

  const [editingMemory, setEditingMemory] = useState<AIMemory | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [editAgent, setEditAgent] = useState<AgentType>("all");

  // Filter memories by agent
  const designAnalystMemories = allMemories?.filter(
    (m) => m.agent === "design_analyst"
  );
  const codeGeneratorMemories = allMemories?.filter(
    (m) => m.agent === "code_generator"
  );
  const seoSpecialistMemories = allMemories?.filter(
    (m) => m.agent === "seo_specialist"
  );
  const sharedMemories = allMemories?.filter((m) => m.agent === "all");

  const startEditing = (memory: AIMemory) => {
    setEditingMemory(memory);
    setEditTitle(memory.title);
    setEditContent(memory.content);
    setEditCategory(memory.category || "general");
    setEditAgent((memory.agent as AgentType) || "all");
  };

  const cancelEditing = () => {
    setEditingMemory(null);
    setEditTitle("");
    setEditContent("");
    setEditCategory("general");
    setEditAgent("all");
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
        agent: editAgent,
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
        agent: newAgent,
      });
      setNewTitle("");
      setNewContent("");
      setNewCategory("general");
      setNewAgent("all");
      setShowForm(false);
      toast.success("Memória adicionada!");
    } catch {
      toast.error("Erro ao adicionar memória");
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

  const getCategoryLabel = (category: string) => {
    return MEMORY_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const totalActive = allMemories?.filter((m) => m.is_active).length || 0;

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case "design_analyst":
        return <Palette className="h-4 w-4" />;
      case "code_generator":
        return <Code className="h-4 w-4" />;
      case "seo_specialist":
        return <Search className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const renderMemoryCard = (memory: AIMemory) => (
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
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label>Agente</Label>
                <Select
                  value={editAgent}
                  onValueChange={(v) => setEditAgent(v as AgentType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AGENT_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                {memory.is_system && (
                  <Badge variant="secondary" className="text-xs">
                    Sistema
                  </Badge>
                )}
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
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {memory.content}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={memory.is_active}
                onCheckedChange={() =>
                  handleToggleMemory(memory.id, memory.is_active)
                }
              />
              {!memory.is_system && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(memory)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMemory(memory.id)}
                    disabled={deleteMemory.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderMemoriesSection = (memories: AIMemory[] | undefined, agentKey: string) => {
    const info = AGENT_INFO[agentKey as keyof typeof AGENT_INFO];
    const activeCount = memories?.filter((m) => m.is_active).length || 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${info.color}-500/10`}>
              {getAgentIcon(agentKey)}
            </div>
            <div>
              <h3 className="font-heading font-semibold">{info.name}</h3>
              <p className="text-sm text-muted-foreground">{info.description}</p>
            </div>
          </div>
          <Badge variant="secondary">
            {activeCount}/{memories?.length || 0} ativas
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : memories && memories.length > 0 ? (
          <div className="space-y-3">
            {memories.map(renderMemoryCard)}
          </div>
        ) : (
          <Card variant="glass" className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma memória para este agente.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setNewAgent(agentKey as AgentType);
                setShowForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Memória
            </Button>
          </Card>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Base de Conhecimento</h1>
            <p className="mt-2 text-muted-foreground">
              Treine os agentes de IA com informações específicas
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
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label>Agente</Label>
                      <Select
                        value={newAgent}
                        onValueChange={(v) => setNewAgent(v as AgentType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(AGENT_INFO).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                {getAgentIcon(key)}
                                {info.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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

            {/* Tabs by Agent */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="design_analyst" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Design</span>
                </TabsTrigger>
                <TabsTrigger value="code_generator" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span className="hidden sm:inline">Code</span>
                </TabsTrigger>
                <TabsTrigger value="seo_specialist" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">SEO</span>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Todas</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="design_analyst" className="mt-6">
                {renderMemoriesSection(designAnalystMemories, "design_analyst")}
              </TabsContent>

              <TabsContent value="code_generator" className="mt-6">
                {renderMemoriesSection(codeGeneratorMemories, "code_generator")}
              </TabsContent>

              <TabsContent value="seo_specialist" className="mt-6">
                {renderMemoriesSection(seoSpecialistMemories, "seo_specialist")}
              </TabsContent>

              <TabsContent value="all" className="mt-6">
                {renderMemoriesSection(sharedMemories, "all")}
              </TabsContent>
            </Tabs>

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
                        agent: "all",
                      });
                      toast.success(
                        `Documento "${doc.name}" adicionado à base de conhecimento`
                      );
                    } catch {
                      toast.error("Erro ao salvar documento");
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Manager */}
            <AgentManager />

            {/* Pipeline explanation */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Pipeline 3 Agentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-violet-500/10 rounded-lg shrink-0">
                    <Palette className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">1. Design Analyst</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cores, fontes e layout
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg shrink-0">
                    <Code className="h-4 w-4 text-cyan-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">2. Code Generator</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      HTML, CSS e JavaScript
                    </p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
                    <Search className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">3. SEO Specialist</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Breadcrumbs, Schema.org, meta tags
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Brain className="h-4 w-4 text-primary" />
                  Dicas de Uso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Design:</strong>{" "}
                  Paletas de cores, fontes e análise de referências visuais.
                </p>
                <p>
                  <strong className="text-foreground">Code:</strong>{" "}
                  Animações CSS, estrutura de arquivos e performance.
                </p>
                <p>
                  <strong className="text-foreground">SEO:</strong>{" "}
                  Breadcrumbs, Schema.org, meta tags e estrutura semântica.
                </p>
                <p>
                  <strong className="text-foreground">Todas:</strong>{" "}
                  Templates de nicho e informações do negócio.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
