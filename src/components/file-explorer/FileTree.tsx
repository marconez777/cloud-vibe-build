import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FileTreeItem } from "@/types/project-files";

interface FileTreeProps {
  items: FileTreeItem[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  previewPage?: string;
}

interface FileTreeNodeProps {
  item: FileTreeItem;
  depth: number;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  previewPage?: string;
}

function getFileIcon(fileType?: string) {
  const colors: Record<string, string> = {
    html: "text-orange-500",
    css: "text-blue-500",
    js: "text-yellow-500",
  };
  return <File className={cn("h-4 w-4", colors[fileType || ""] || "text-muted-foreground")} />;
}

function FileTreeNode({ item, depth, selectedPath, onSelectFile, previewPage }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = item.type === "folder";
  const isSelected = selectedPath === item.path;
  const isPreviewPage = item.fileType === "html" && item.path === previewPage;

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(item.path);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-1 cursor-pointer rounded-md text-sm transition-colors",
          isSelected
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted/50 text-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isFolder ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {isOpen ? (
              <FolderOpen className="h-4 w-4 text-primary" />
            ) : (
              <Folder className="h-4 w-4 text-primary" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            {getFileIcon(item.fileType)}
          </>
        )}
        <span className="truncate flex-1">{item.name}</span>
        {isPreviewPage && (
          <Eye className="h-3 w-3 text-primary ml-auto" />
        )}
      </div>
      {isFolder && isOpen && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeNode
              key={child.path}
              item={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
              previewPage={previewPage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ items, selectedPath, onSelectFile, previewPage }: FileTreeProps) {
  if (items.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Nenhum arquivo gerado ainda
      </div>
    );
  }

  return (
    <div className="py-2">
      {items.map((item) => (
        <FileTreeNode
          key={item.path}
          item={item}
          depth={0}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
          previewPage={previewPage}
        />
      ))}
    </div>
  );
}
