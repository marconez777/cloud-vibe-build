import { Theme, ThemeFile, THEME_CATEGORIES } from "@/types/themes";
import { useThemeFiles } from "@/hooks/useThemes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, FileText, Image, Type, HardDrive, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ThemePreviewProps {
  theme: Theme | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  html: <FileCode className="h-4 w-4 text-orange-500" />,
  php: <FileCode className="h-4 w-4 text-purple-500" />,
  css: <FileText className="h-4 w-4 text-blue-500" />,
  js: <FileText className="h-4 w-4 text-yellow-500" />,
  json: <FileText className="h-4 w-4 text-green-500" />,
  image: <Image className="h-4 w-4 text-pink-500" />,
  font: <Type className="h-4 w-4 text-gray-500" />,
  svg: <FileCode className="h-4 w-4 text-cyan-500" />,
};

export function ThemePreview({ theme, open, onOpenChange }: ThemePreviewProps) {
  const { data: files = [], isLoading } = useThemeFiles(theme?.id);

  if (!theme) return null;

  const categoryLabel = THEME_CATEGORIES.find(c => c.value === theme.category)?.label || theme.category;
  
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  // Group files by type
  const groupedFiles = files.reduce((acc, file) => {
    const type = file.file_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(file);
    return acc;
  }, {} as Record<string, ThemeFile[]>);

  // Get index.html for preview
  const indexFile = files.find(f => f.file_name === "index.html" || f.file_name === "index.php");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {theme.name}
            <Badge variant="secondary">{categoryLabel}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preview" className="flex-1">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="files">Arquivos ({files.length})</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-lg overflow-hidden bg-white">
              {indexFile?.content ? (
                <iframe
                  srcDoc={indexFile.content}
                  className="w-full h-[500px]"
                  title="Theme Preview"
                  sandbox="allow-scripts"
                />
              ) : theme.preview_image_url ? (
                <img
                  src={theme.preview_image_url}
                  alt={theme.name}
                  className="w-full h-[500px] object-contain"
                />
              ) : (
                <div className="w-full h-[500px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FileCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Nenhum preview disponível</p>
                    <p className="text-sm">O tema não possui index.html ou imagem de preview</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Carregando arquivos...
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedFiles).map(([type, typeFiles]) => (
                    <div key={type}>
                      <h4 className="font-medium text-sm text-muted-foreground uppercase mb-2 flex items-center gap-2">
                        {FILE_TYPE_ICONS[type] || <FileText className="h-4 w-4" />}
                        {type} ({typeFiles.length})
                      </h4>
                      <div className="space-y-1">
                        {typeFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 text-sm"
                          >
                            <span className="truncate flex-1">{file.file_path}</span>
                            <span className="text-muted-foreground text-xs ml-2">
                              {formatBytes(file.size_bytes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="info" className="mt-4">
            <div className="space-y-4">
              {theme.description && (
                <div>
                  <h4 className="font-medium mb-1">Descrição</h4>
                  <p className="text-muted-foreground">{theme.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{theme.file_count}</strong> arquivos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{formatBytes(theme.total_size_bytes)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Criado em {format(new Date(theme.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {theme.tags && theme.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {theme.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
