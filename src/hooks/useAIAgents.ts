import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AIAgent {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  system_prompt: string | null;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export const AGENT_COLORS = [
  { value: "violet", label: "Violeta", class: "bg-violet-500" },
  { value: "cyan", label: "Ciano", class: "bg-cyan-500" },
  { value: "amber", label: "Âmbar", class: "bg-amber-500" },
  { value: "emerald", label: "Esmeralda", class: "bg-emerald-500" },
  { value: "rose", label: "Rosa", class: "bg-rose-500" },
  { value: "blue", label: "Azul", class: "bg-blue-500" },
  { value: "orange", label: "Laranja", class: "bg-orange-500" },
  { value: "teal", label: "Teal", class: "bg-teal-500" },
  { value: "indigo", label: "Índigo", class: "bg-indigo-500" },
  { value: "pink", label: "Pink", class: "bg-pink-500" },
] as const;

export const AGENT_ICONS = [
  { value: "bot", label: "Bot" },
  { value: "brain", label: "Cérebro" },
  { value: "code", label: "Código" },
  { value: "palette", label: "Paleta" },
  { value: "search", label: "Busca" },
  { value: "sparkles", label: "Brilhos" },
  { value: "wand-2", label: "Varinha" },
  { value: "message-square", label: "Mensagem" },
  { value: "file-text", label: "Documento" },
  { value: "share-2", label: "Compartilhar" },
  { value: "zap", label: "Raio" },
  { value: "target", label: "Alvo" },
] as const;

export function useAIAgents() {
  return useQuery({
    queryKey: ["ai-agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .order("is_system", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as AIAgent[];
    },
  });
}

export function useActiveAgents() {
  return useQuery({
    queryKey: ["ai-agents", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("is_active", true)
        .order("is_system", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as AIAgent[];
    },
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      slug,
      description,
      color = "blue",
      icon = "bot",
      system_prompt,
    }: {
      name: string;
      slug: string;
      description?: string;
      color?: string;
      icon?: string;
      system_prompt?: string;
    }) => {
      const { data, error } = await supabase
        .from("ai_agents")
        .insert({ name, slug, description, color, icon, system_prompt, is_system: false })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
      color,
      icon,
      system_prompt,
    }: {
      id: string;
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      system_prompt?: string;
    }) => {
      const updateData: Partial<AIAgent> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (color !== undefined) updateData.color = color;
      if (icon !== undefined) updateData.icon = icon;
      if (system_prompt !== undefined) updateData.system_prompt = system_prompt;

      const { error } = await supabase
        .from("ai_agents")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
    },
  });
}

export function useToggleAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("ai_agents")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_agents")
        .delete()
        .eq("id", id)
        .eq("is_system", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-agents"] });
    },
  });
}

export function getAgentColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rose: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    teal: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  };
  return colorMap[color] || colorMap.blue;
}

export function getAgentBadgeClass(color: string): string {
  const colorMap: Record<string, string> = {
    violet: "bg-violet-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    teal: "bg-teal-500",
    indigo: "bg-indigo-500",
    pink: "bg-pink-500",
  };
  return colorMap[color] || colorMap.blue;
}
