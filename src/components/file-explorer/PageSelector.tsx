import { FileText, Home } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ProjectFile } from "@/types/project-files";

interface PageSelectorProps {
  files: ProjectFile[];
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function PageSelector({ files, currentPage, onPageChange }: PageSelectorProps) {
  // Filter HTML files that are not components (header, footer, etc.)
  const htmlPages = files.filter(
    (f) =>
      f.file_type === "html" &&
      !f.file_path.startsWith("components/") &&
      !f.file_path.includes("/components/")
  );

  if (htmlPages.length <= 1) {
    return null;
  }

  // Sort with index.html first
  const sortedPages = [...htmlPages].sort((a, b) => {
    if (a.file_name === "index.html") return -1;
    if (b.file_name === "index.html") return 1;
    return a.file_name.localeCompare(b.file_name);
  });

  return (
    <div className="flex items-center gap-2">
      <Select value={currentPage} onValueChange={onPageChange}>
        <SelectTrigger className="h-8 w-[200px] bg-background">
          <SelectValue placeholder="Selecionar página" />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {sortedPages.map((page) => (
            <SelectItem key={page.file_path} value={page.file_path}>
              <div className="flex items-center gap-2">
                {page.file_name === "index.html" ? (
                  <Home className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span>{page.file_name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Badge variant="secondary" className="text-xs">
        {htmlPages.length} {htmlPages.length === 1 ? "página" : "páginas"}
      </Badge>
    </div>
  );
}
