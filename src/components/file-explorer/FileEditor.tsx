import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectFile } from "@/types/project-files";

interface FileEditorProps {
  file: ProjectFile | null;
  onSave: (fileId: string, content: string) => Promise<void>;
  isSaving: boolean;
}

function getSyntaxHighlightClass(fileType: string) {
  const classes: Record<string, string> = {
    html: "language-html",
    css: "language-css",
    js: "language-javascript",
  };
  return classes[fileType] || "";
}

export function FileEditor({ file, onSave, isSaving }: FileEditorProps) {
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (file) {
      setContent(file.content);
      setHasChanges(false);
    }
  }, [file]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(e.target.value !== file?.content);
  };

  const handleSave = async () => {
    if (file && hasChanges) {
      await onSave(file.id, content);
      setHasChanges(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
    
    // Handle Tab key for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = content.substring(0, start) + "  " + content.substring(end);
      setContent(newContent);
      setHasChanges(true);
      
      // Set cursor position after tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Selecione um arquivo para editar</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{file.file_name}</span>
          {hasChanges && (
            <span className="text-xs text-muted-foreground">(modificado)</span>
          )}
        </div>
        <Button
          size="sm"
          variant={hasChanges ? "hero" : "outline"}
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <Save className="mr-2 h-3 w-3" />
          )}
          Salvar
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-full w-full resize-none bg-background p-4 font-mono text-sm focus:outline-none",
            getSyntaxHighlightClass(file.file_type)
          )}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
