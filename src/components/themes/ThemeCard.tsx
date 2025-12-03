import { useState } from "react";
import { Theme, THEME_CATEGORIES } from "@/types/themes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, FileCode, HardDrive } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ThemeCardProps {
  theme: Theme;
  onPreview: (theme: Theme) => void;
  onDelete: (themeId: string) => void;
  isDeleting?: boolean;
}

export function ThemeCard({ theme, onPreview, onDelete, isDeleting }: ThemeCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const categoryLabel = THEME_CATEGORIES.find(c => c.value === theme.category)?.label || theme.category;
  
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Preview Image */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {theme.preview_image_url ? (
          <img
            src={theme.preview_image_url}
            alt={theme.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileCode className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => onPreview(theme)}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            disabled={isDeleting}
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir tema?"
        description={`Esta ação não pode ser desfeita. O tema "${theme.name}" e todos os seus arquivos serão excluídos permanentemente.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={() => onDelete(theme.id)}
        isLoading={isDeleting}
        variant="destructive"
      />

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold truncate">{theme.name}</h3>
          <Badge variant="secondary" className="shrink-0">
            {categoryLabel}
          </Badge>
        </div>

        {theme.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {theme.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileCode className="h-3 w-3" />
            {theme.file_count} arquivos
          </span>
          <span className="flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            {formatBytes(theme.total_size_bytes)}
          </span>
        </div>

        {theme.tags && theme.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {theme.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {theme.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{theme.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
