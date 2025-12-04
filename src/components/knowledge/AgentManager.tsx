import { useState } from "react";
import { Plus, Bot, Edit2, Trash2, Power, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useAIAgents,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
  useToggleAgent,
  AIAgent,
  AGENT_COLORS,
  AGENT_ICONS,
  AI_MODELS,
  getAgentColorClass,
  getAgentBadgeClass,
} from "@/hooks/useAIAgents";
import * as LucideIcons from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const iconName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("") as keyof typeof LucideIcons;
  
  const Icon = LucideIcons[iconName] as React.ComponentType<{ className?: string }>;
  
  if (!Icon) {
    return <Bot className={className} />;
  }
  
  return <Icon className={className} />;
}

export function AgentManager() {
  const { data: agents, isLoading } = useAIAgents();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();
  const toggleAgent = useToggleAgent();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: "blue",
    icon: "bot",
    system_prompt: "",
    model: "gpt-4o",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      color: "blue",
      icon: "bot",
      system_prompt: "",
      model: "gpt-4o",
    });
    setEditingAgent(null);
  };

  const handleOpenDialog = (agent?: AIAgent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        slug: agent.slug,
        description: agent.description || "",
        color: agent.color,
        icon: agent.icon,
        system_prompt: agent.system_prompt || "",
        model: agent.model || "gpt-4o",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingAgent ? prev.slug : slugify(name),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome do agente é obrigatório");
      return;
    }

    try {
      if (editingAgent) {
        await updateAgent.mutateAsync({
          id: editingAgent.id,
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
          system_prompt: formData.system_prompt,
          model: formData.model,
        });
        toast.success("Agente atualizado com sucesso!");
      } else {
        await createAgent.mutateAsync({
          name: formData.name,
          slug: formData.slug || slugify(formData.name),
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
          system_prompt: formData.system_prompt,
          model: formData.model,
        });
        toast.success("Agente criado com sucesso!");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Já existe um agente com esse identificador");
      } else {
        toast.error("Erro ao salvar agente");
      }
    }
  };

  const handleDelete = async (agent: AIAgent) => {
    if (agent.is_system) {
      toast.error("Agentes do sistema não podem ser excluídos");
      return;
    }

    try {
      await deleteAgent.mutateAsync(agent.id);
      toast.success("Agente excluído com sucesso!");
    } catch {
      toast.error("Erro ao excluir agente");
    }
  };

  const handleToggle = async (agent: AIAgent) => {
    try {
      await toggleAgent.mutateAsync({ id: agent.id, is_active: !agent.is_active });
      toast.success(agent.is_active ? "Agente desativado" : "Agente ativado");
    } catch {
      toast.error("Erro ao alterar status do agente");
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const systemAgents = agents?.filter((a) => a.is_system) || [];
  const customAgents = agents?.filter((a) => !a.is_system) || [];

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Agentes de IA
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os agentes que processam as gerações
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? "Editar Agente" : "Criar Novo Agente"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Content Writer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Identificador (slug)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="content_writer"
                  disabled={!!editingAgent}
                />
                <p className="text-xs text-muted-foreground">
                  Usado internamente para identificar o agente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Descreva o que este agente faz"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, color: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${color.class}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, icon: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGENT_ICONS.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <DynamicIcon name={icon.value} className="h-4 w-4" />
                            {icon.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Modelo de IA</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, model: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        <div className="flex flex-col">
                          <span>{m.label}</span>
                          <span className="text-xs text-muted-foreground">{m.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Modelo usado para processar as requisições
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt (opcional)</Label>
                <Textarea
                  id="system_prompt"
                  value={formData.system_prompt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, system_prompt: e.target.value }))
                  }
                  placeholder="Instruções base para o agente..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Prompt inicial que define o comportamento do agente
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createAgent.isPending || updateAgent.isPending}
                >
                  {editingAgent ? "Salvar" : "Criar Agente"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Agents */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Agentes do Sistema
          </h4>
          <div className="grid gap-3">
            {systemAgents.map((agent) => (
              <div
                key={agent.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getAgentColorClass(agent.color)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getAgentBadgeClass(agent.color)}`}>
                    <DynamicIcon name={agent.icon} className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-xs opacity-70">{agent.description}</p>
                    <p className="text-xs opacity-50">Modelo: {agent.model || "gpt-4o"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(agent)}
                    title="Editar modelo"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    Sistema
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Agents */}
        {customAgents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Agentes Customizados
            </h4>
            <div className="grid gap-3">
              {customAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getAgentColorClass(agent.color)} ${!agent.is_active ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getAgentBadgeClass(agent.color)}`}>
                      <DynamicIcon name={agent.icon} className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs opacity-70">{agent.description}</p>
                      <p className="text-xs opacity-50">Modelo: {agent.model || "gpt-4o"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={agent.is_active}
                      onCheckedChange={() => handleToggle(agent)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(agent)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(agent)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {customAgents.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Bot className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum agente customizado criado ainda</p>
            <p className="text-xs">Crie agentes para expandir as capacidades de geração</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
