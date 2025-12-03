import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemes, useDeleteTheme } from "@/hooks/useThemes";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Theme, THEME_CATEGORIES } from "@/types/themes";
import { ThemeCard } from "@/components/themes/ThemeCard";
import { ThemeUpload } from "@/components/themes/ThemeUpload";
import { ThemePreview } from "@/components/themes/ThemePreview";
import { Upload, Search, Palette, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Themes() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: themes = [], isLoading } = useThemes();
  const deleteTheme = useDeleteTheme();
  const { toast } = useToast();

  const handleDelete = async (themeId: string) => {
    try {
      await deleteTheme.mutateAsync(themeId);
      toast({
        title: "Tema excluído",
        description: "O tema foi excluído com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    }
  };

  // Filter themes
  const filteredThemes = themes.filter((theme) => {
    const matchesSearch =
      theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || theme.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const pagination = usePagination(filteredThemes, { itemsPerPage: 9 });

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Palette className="h-8 w-8 text-primary" />
              Biblioteca de Temas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie templates HTML/PHP para usar como base em novos projetos
            </p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Tema
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar temas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {THEME_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredThemes.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            {themes.length === 0 ? (
              <>
                <h3 className="text-lg font-medium mb-2">Nenhum tema ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Faça upload de templates HTML/PHP em formato ZIP para usar como base em seus projetos.
                </p>
                <Button onClick={() => setUploadOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload do Primeiro Tema
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">Nenhum resultado</h3>
                <p className="text-muted-foreground">
                  Nenhum tema encontrado com os filtros aplicados.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagination.paginatedItems.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  onPreview={setPreviewTheme}
                  onDelete={handleDelete}
                  isDeleting={deleteTheme.isPending}
                />
              ))}
            </div>
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.goToPage}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              totalItems={pagination.totalItems}
              className="mt-6"
            />
          </>
        )}

        {/* Dialogs */}
        <ThemeUpload open={uploadOpen} onOpenChange={setUploadOpen} />
        <ThemePreview
          theme={previewTheme}
          open={!!previewTheme}
          onOpenChange={(open) => !open && setPreviewTheme(null)}
        />
      </div>
    </AppLayout>
  );
}
