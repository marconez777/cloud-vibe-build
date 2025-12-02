import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectFile, FileTreeItem } from "@/types/project-files";

export function useProjectFiles(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-files", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", projectId)
        .order("file_path");

      if (error) throw error;
      return data as ProjectFile[];
    },
    enabled: !!projectId,
  });
}

export function useUpdateFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fileId,
      content,
    }: {
      fileId: string;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("project_files")
        .update({ content })
        .eq("id", fileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["project-files", data.project_id],
      });
    },
  });
}

export function useDeleteProjectFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from("project_files")
        .delete()
        .eq("project_id", projectId);

      if (error) throw error;
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({
        queryKey: ["project-files", projectId],
      });
    },
  });
}

// Build file tree from flat list
export function buildFileTree(files: ProjectFile[]): FileTreeItem[] {
  const root: FileTreeItem[] = [];
  const folderMap = new Map<string, FileTreeItem>();

  // Sort files by path to ensure parents are created before children
  const sortedFiles = [...files].sort((a, b) =>
    a.file_path.localeCompare(b.file_path)
  );

  for (const file of sortedFiles) {
    const parts = file.file_path.split("/");
    let currentPath = "";
    let currentLevel = root;

    // Create folders
    for (let i = 0; i < parts.length - 1; i++) {
      const folderName = parts[i];
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

      if (!folderMap.has(currentPath)) {
        const folder: FileTreeItem = {
          name: folderName,
          path: currentPath,
          type: "folder",
          children: [],
        };
        currentLevel.push(folder);
        folderMap.set(currentPath, folder);
      }

      currentLevel = folderMap.get(currentPath)!.children!;
    }

    // Add file
    const fileItem: FileTreeItem = {
      name: file.file_name,
      path: file.file_path,
      type: "file",
      fileType: file.file_type as 'html' | 'css' | 'js',
    };
    currentLevel.push(fileItem);
  }

  return root;
}
