import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AgentType = "design_analyst" | "code_generator" | "seo_specialist" | "all";

export interface AIMemory {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  agent: AgentType;
  is_active: boolean | null;
  is_system: boolean | null;
  priority: number | null;
  created_at: string;
  updated_at: string;
}

export const MEMORY_CATEGORIES = [
  { value: "general", label: "Geral" },
  { value: "branding", label: "Branding" },
  { value: "content", label: "Conteúdo" },
  { value: "estrutura", label: "Estrutura" },
  { value: "estilo", label: "Estilo" },
  { value: "business", label: "Negócio" },
] as const;

export const MEMORY_MAX_LENGTH = 5000; // Max characters for memory content

export const AGENT_INFO = {
  design_analyst: {
    name: "Design Analyst",
    description: "Analisa imagens e define cores, fontes, layout",
    color: "violet",
  },
  code_generator: {
    name: "Code Generator",
    description: "Gera HTML, CSS e JavaScript",
    color: "cyan",
  },
  seo_specialist: {
    name: "SEO Specialist",
    description: "Otimiza meta tags, Schema.org, breadcrumbs",
    color: "amber",
  },
  all: {
    name: "Compartilhadas",
    description: "Usadas por todos os agentes",
    color: "emerald",
  },
} as const;

export function useAIMemories() {
  return useQuery({
    queryKey: ["ai-memories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_memories")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AIMemory[];
    },
  });
}

export function useSystemMemories() {
  return useQuery({
    queryKey: ["ai-memories", "system"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_memories")
        .select("*")
        .eq("is_system", true)
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as AIMemory[];
    },
  });
}

export function useUserMemories() {
  return useQuery({
    queryKey: ["ai-memories", "user"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_memories")
        .select("*")
        .eq("is_system", false)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AIMemory[];
    },
  });
}

export function useActiveMemories() {
  return useQuery({
    queryKey: ["ai-memories", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_memories")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as AIMemory[];
    },
  });
}

export function useMemoriesByAgent(agent: AgentType) {
  return useQuery({
    queryKey: ["ai-memories", "agent", agent],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_memories")
        .select("*")
        .or(`agent.eq.${agent},agent.eq.all`)
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as AIMemory[];
    },
  });
}

export function useMemoriesFilteredByAgent(agent: AgentType | "all_agents") {
  return useQuery({
    queryKey: ["ai-memories", "filter", agent],
    queryFn: async () => {
      let query = supabase
        .from("ai_memories")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (agent !== "all_agents") {
        query = query.eq("agent", agent);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AIMemory[];
    },
  });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      content,
      type = "instruction",
      category = "general",
      priority = 0,
      agent = "all",
    }: {
      title: string;
      content: string;
      type?: string;
      category?: string;
      priority?: number;
      agent?: AgentType;
    }) => {
      // Validate content length
      if (content.length > MEMORY_MAX_LENGTH) {
        throw new Error(`Conteúdo excede o limite de ${MEMORY_MAX_LENGTH} caracteres`);
      }
      
      const { data, error } = await supabase
        .from("ai_memories")
        .insert({ title, content, type, category, priority, agent, is_system: false })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-memories"] });
    },
  });
}

export function useToggleMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("ai_memories")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-memories"] });
    },
  });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      category,
      agent,
    }: {
      id: string;
      title: string;
      content: string;
      category: string;
      agent?: AgentType;
    }) => {
      // Validate content length
      if (content.length > MEMORY_MAX_LENGTH) {
        throw new Error(`Conteúdo excede o limite de ${MEMORY_MAX_LENGTH} caracteres`);
      }
      
      const updateData: any = { title, content, category };
      if (agent) updateData.agent = agent;

      const { error } = await supabase
        .from("ai_memories")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-memories"] });
    },
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_memories")
        .delete()
        .eq("id", id)
        .eq("is_system", false); // Prevent deleting system memories

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-memories"] });
    },
  });
}
