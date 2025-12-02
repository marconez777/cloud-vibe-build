import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AIMemory {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  is_active: boolean;
  is_system: boolean;
  priority: number;
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

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      content,
      type = "instruction",
      category = "general",
      priority = 0,
    }: {
      title: string;
      content: string;
      type?: string;
      category?: string;
      priority?: number;
    }) => {
      const { data, error } = await supabase
        .from("ai_memories")
        .insert({ title, content, type, category, priority, is_system: false })
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
    }: {
      id: string;
      title: string;
      content: string;
      category: string;
    }) => {
      const { error } = await supabase
        .from("ai_memories")
        .update({ title, content, category })
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
