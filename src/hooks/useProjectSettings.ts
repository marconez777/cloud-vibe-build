import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProjectSettings {
  id: string;
  project_id: string;
  company_name: string | null;
  slogan: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  gallery_images: string[];
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  social_links: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
  };
  business_hours: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  custom_fields: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export type ProjectSettingsInsert = Omit<ProjectSettings, "id" | "created_at" | "updated_at">;
export type ProjectSettingsUpdate = Partial<ProjectSettingsInsert>;

export function useProjectSettings(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-settings", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      const { data, error } = await supabase
        .from("project_settings")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;
      return data as ProjectSettings | null;
    },
    enabled: !!projectId,
  });
}

export function useCreateProjectSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: ProjectSettingsInsert) => {
      const { data, error } = await supabase
        .from("project_settings")
        .insert(settings)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectSettings;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-settings", data.project_id] });
      toast({ title: "Configurações salvas!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateProjectSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, settings }: { projectId: string; settings: ProjectSettingsUpdate }) => {
      const { data, error } = await supabase
        .from("project_settings")
        .update(settings)
        .eq("project_id", projectId)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectSettings;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-settings", data.project_id] });
      toast({ title: "Configurações atualizadas!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpsertProjectSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, settings }: { projectId: string; settings: ProjectSettingsUpdate }) => {
      const { data, error } = await supabase
        .from("project_settings")
        .upsert({ project_id: projectId, ...settings }, { onConflict: "project_id" })
        .select()
        .single();

      if (error) throw error;
      return data as ProjectSettings;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-settings", data.project_id] });
      toast({ title: "Configurações salvas!" });
    },
    onError: (error) => {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    },
  });
}

export function useUploadSettingsImage() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, path }: { file: File; path: string }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("project-assets")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-assets")
        .getPublicUrl(fileName);

      return publicUrl;
    },
    onError: (error) => {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    },
  });
}
