import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Theme, ThemeFile } from "@/types/themes";

export function useThemes() {
  return useQuery({
    queryKey: ["themes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Theme[];
    },
  });
}

export function useTheme(id: string | undefined) {
  return useQuery({
    queryKey: ["theme", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Theme;
    },
    enabled: !!id,
  });
}

export function useThemeFiles(themeId: string | undefined) {
  return useQuery({
    queryKey: ["theme-files", themeId],
    queryFn: async () => {
      if (!themeId) return [];
      const { data, error } = await supabase
        .from("theme_files")
        .select("*")
        .eq("theme_id", themeId)
        .order("file_path");
      
      if (error) throw error;
      return data as ThemeFile[];
    },
    enabled: !!themeId,
  });
}

export function useCreateTheme() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await supabase.functions.invoke("import-theme", {
        body: formData,
      });
      
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });
}

export function useDeleteTheme() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (themeId: string) => {
      // Delete from storage first
      const { data: files } = await supabase
        .from("theme_files")
        .select("storage_url")
        .eq("theme_id", themeId)
        .not("storage_url", "is", null);
      
      if (files && files.length > 0) {
        const paths = files
          .map(f => f.storage_url)
          .filter(Boolean)
          .map(url => {
            const match = url?.match(/theme-assets\/(.+)$/);
            return match ? match[1] : null;
          })
          .filter(Boolean) as string[];
        
        if (paths.length > 0) {
          await supabase.storage.from("theme-assets").remove(paths);
        }
      }
      
      // Delete theme (cascade will delete theme_files)
      const { error } = await supabase
        .from("themes")
        .delete()
        .eq("id", themeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["themes"] });
    },
  });
}

export function useCopyThemeToProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ themeId, projectId }: { themeId: string; projectId: string }) => {
      // Get theme files
      const { data: themeFiles, error: filesError } = await supabase
        .from("theme_files")
        .select("*")
        .eq("theme_id", themeId);
      
      if (filesError) throw filesError;
      if (!themeFiles || themeFiles.length === 0) {
        throw new Error("Tema não possui arquivos");
      }
      
      // Copy text files to project_files
      const textFiles = themeFiles
        .filter(f => f.content)
        .map(f => ({
          project_id: projectId,
          file_path: f.file_path,
          file_name: f.file_name,
          file_type: f.file_type,
          content: f.content!,
        }));
      
      // Copy binary files (images/fonts) - create placeholder entries with storage URLs
      const binaryFiles = themeFiles
        .filter(f => f.storage_url && !f.content)
        .map(f => ({
          project_id: projectId,
          file_path: f.file_path,
          file_name: f.file_name,
          file_type: f.file_type,
          // Store storage URL as content for binary files - can be used during export
          content: `<!-- ASSET_URL: ${f.storage_url} -->`,
        }));
      
      const allFiles = [...textFiles, ...binaryFiles];
      
      if (allFiles.length > 0) {
        const { error: insertError } = await supabase
          .from("project_files")
          .insert(allFiles);
        
        if (insertError) throw insertError;
      }
      
      return { 
        copiedFiles: allFiles.length,
        textFiles: textFiles.length,
        binaryFiles: binaryFiles.length,
      };
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
    },
  });
}
