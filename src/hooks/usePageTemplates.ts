import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTemplate, TemplateVariation } from "@/types/page-templates";

export function usePageTemplates(projectId: string | undefined) {
  return useQuery({
    queryKey: ["page-templates", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("page_templates")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PageTemplate[];
    },
    enabled: !!projectId,
  });
}

export function usePageTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: ["page-template", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const { data, error } = await supabase
        .from("page_templates")
        .select("*")
        .eq("id", templateId)
        .maybeSingle();

      if (error) throw error;
      return data as PageTemplate | null;
    },
    enabled: !!templateId,
  });
}

export function useCreatePageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: {
      project_id: string;
      name: string;
      source_file_path: string;
      tags: string[];
      output_pattern: string;
      output_folder: string;
      variations: TemplateVariation[];
    }) => {
      const { data, error } = await supabase
        .from("page_templates")
        .insert({
          project_id: template.project_id,
          name: template.name,
          source_file_path: template.source_file_path,
          tags: template.tags,
          output_pattern: template.output_pattern,
          output_folder: template.output_folder,
          variations: JSON.parse(JSON.stringify(template.variations)),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["page-templates", variables.project_id] });
    },
  });
}

export function useUpdatePageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<PageTemplate> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.variations) {
        updateData.variations = updates.variations as unknown as Record<string, unknown>;
      }

      const { data, error } = await supabase
        .from("page_templates")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["page-templates", data.project_id] });
      queryClient.invalidateQueries({ queryKey: ["page-template", data.id] });
    },
  });
}

export function useDeletePageTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from("page_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { id, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["page-templates", data.projectId] });
    },
  });
}

// Utility functions
export function detectTags(content: string): string[] {
  const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  const tags = new Set<string>();
  let match;
  while ((match = regex.exec(content)) !== null) {
    tags.add(match[1]);
  }
  return Array.from(tags);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export function generatePageContent(
  template: string,
  variation: TemplateVariation
): string {
  let content = template;
  Object.entries(variation).forEach(([tag, value]) => {
    const regex = new RegExp(`\\{${tag}\\}`, "gi");
    content = content.replace(regex, value);
  });
  return content;
}

export function generateFileName(
  pattern: string,
  variation: TemplateVariation
): string {
  let fileName = pattern;
  Object.entries(variation).forEach(([tag, value]) => {
    const regex = new RegExp(`\\{${tag}\\}`, "gi");
    fileName = fileName.replace(regex, slugify(value));
  });
  return fileName;
}
