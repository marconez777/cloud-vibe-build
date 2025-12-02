import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  project_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useChatMessages(projectId: string | undefined) {
  return useQuery({
    queryKey: ["chat-messages", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!projectId,
  });
}

export function useSaveChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      role,
      content,
      metadata = {},
    }: {
      projectId: string;
      role: "user" | "assistant" | "system";
      content: string;
      metadata?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert([{
          project_id: projectId,
          role,
          content,
          metadata: metadata as any,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", variables.projectId] });
    },
  });
}

export function useClearChatHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("project_id", projectId);

      if (error) throw error;
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", projectId] });
    },
  });
}
