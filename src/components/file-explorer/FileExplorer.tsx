import { useState, useMemo } from "react";
import { FileTree } from "./FileTree";
import { FileEditor } from "./FileEditor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectFiles, useUpdateFile, buildFileTree } from "@/hooks/useProjectFiles";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FileExplorerProps {
  projectId: string;
  previewPage?: string;
  onPreviewPage?: (path: string) => void;
}

export function FileExplorer({ projectId, previewPage, onPreviewPage }: FileExplorerProps) {
  const { data: files, isLoading } = useProjectFiles(projectId);
  const updateFile = useUpdateFile();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Handle file selection - trigger preview for HTML files
  const handleSelectFile = (path: string) => {
    setSelectedPath(path);
    
    // If it's an HTML file (not in components folder), notify parent for preview
    if (
      path.endsWith('.html') && 
      !path.startsWith('components/') && 
      !path.includes('/components/') &&
      onPreviewPage
    ) {
      onPreviewPage(path);
    }
  };

  const fileTree = useMemo(() => {
    if (!files) return [];
    return buildFileTree(files);
  }, [files]);

  const selectedFile = useMemo(() => {
    if (!files || !selectedPath) return null;
    return files.find((f) => f.file_path === selectedPath) || null;
  }, [files, selectedPath]);

  const handleSave = async (fileId: string, content: string) => {
    try {
      await updateFile.mutateAsync({ fileId, content });
      toast.success("Arquivo salvo!");
    } catch (error) {
      toast.error("Erro ao salvar arquivo");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Nenhum arquivo gerado ainda</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* File Tree */}
      <div className="w-48 border-r border-border">
        <ScrollArea className="h-full">
          <FileTree
            items={fileTree}
            selectedPath={selectedPath}
            onSelectFile={handleSelectFile}
            previewPage={previewPage}
          />
        </ScrollArea>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <FileEditor
          file={selectedFile}
          onSave={handleSave}
          isSaving={updateFile.isPending}
        />
      </div>
    </div>
  );
}
