import { ProjectFile } from "@/types/project-files";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileCode, FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TemplateSelectorProps {
  files: ProjectFile[];
  selectedFile: string | null;
  onSelect: (filePath: string) => void;
}

export function TemplateSelector({
  files,
  selectedFile,
  onSelect,
}: TemplateSelectorProps) {
  const htmlFiles = files.filter((f) => f.file_type === "html");

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Página Base (Template)
      </label>
      <Select value={selectedFile || ""} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma página HTML..." />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="max-h-[200px]">
            {htmlFiles.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhum arquivo HTML encontrado
              </div>
            ) : (
              htmlFiles.map((file) => (
                <SelectItem key={file.id} value={file.file_path}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span>{file.file_path}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
