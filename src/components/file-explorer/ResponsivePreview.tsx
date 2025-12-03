import { useState, useCallback } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProjectFile } from "@/types/project-files";
import { FilePreview } from "./FilePreview";
import { PageSelector } from "./PageSelector";

interface ResponsivePreviewProps {
  files: ProjectFile[];
}

type ViewportSize = "desktop" | "tablet" | "mobile";

const viewportSizes: Record<ViewportSize, { width: number; label: string; icon: typeof Monitor }> = {
  desktop: { width: 1200, label: "Desktop", icon: Monitor },
  tablet: { width: 768, label: "Tablet", icon: Tablet },
  mobile: { width: 375, label: "Mobile", icon: Smartphone },
};

export function ResponsivePreview({ files }: ResponsivePreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [currentPage, setCurrentPage] = useState<string>("index.html");
  const currentViewport = viewportSizes[viewport];

  const handleNavigate = useCallback((page: string) => {
    // Normalize the page path (remove ./ prefix if present)
    const normalizedPage = page.replace(/^\.\//, "");
    setCurrentPage(normalizedPage);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 p-2">
        {/* Page Selector */}
        <PageSelector
          files={files}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />

        {/* Viewport Controls */}
        <div className="flex items-center gap-1">
          {(Object.entries(viewportSizes) as [ViewportSize, typeof currentViewport][]).map(
            ([key, { label, icon: Icon }]) => (
              <Button
                key={key}
                variant={viewport === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewport(key)}
                className={cn(
                  "gap-2",
                  viewport === key && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            )
          )}
          <span className="ml-2 text-xs text-muted-foreground">
            {currentViewport.width}px
          </span>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto bg-muted/20 p-4">
        <div
          className={cn(
            "mx-auto h-full overflow-hidden rounded-lg border border-border bg-background shadow-lg transition-all duration-300",
            viewport === "desktop" && "w-full max-w-[1200px]",
            viewport === "tablet" && "w-[768px]",
            viewport === "mobile" && "w-[375px]"
          )}
        >
          <FilePreview 
            files={files} 
            currentPage={currentPage}
            onNavigate={handleNavigate}
          />
        </div>
      </div>
    </div>
  );
}
