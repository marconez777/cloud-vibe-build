import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Settings,
  Globe,
  FileCode,
  Shield,
  Map,
  Image,
  Download,
  Loader2,
  Package,
} from "lucide-react";

export interface ExportOptions {
  includeReadme: boolean;
  includeHtaccess: boolean;
  includeSitemap: boolean;
  includeCompiled: boolean;
  includeFavicon: boolean;
  siteUrl: string;
}

interface ExportOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportOptions) => void;
  isExporting: boolean;
  projectName: string;
  filesCount: number;
}

export function ExportOptionsDialog({
  open,
  onOpenChange,
  onExport,
  isExporting,
  projectName,
  filesCount,
}: ExportOptionsDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeReadme: true,
    includeHtaccess: true,
    includeSitemap: true,
    includeCompiled: true,
    includeFavicon: true,
    siteUrl: "https://seusite.com",
  });

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const extraFilesCount =
    (options.includeReadme ? 1 : 0) +
    (options.includeHtaccess ? 1 : 0) +
    (options.includeSitemap ? 1 : 0) +
    (options.includeCompiled ? 1 : 0) +
    (options.includeFavicon ? 1 : 0) +
    1; // robots.txt always included

  const totalFiles = filesCount + extraFilesCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Exportar {projectName}
          </DialogTitle>
          <DialogDescription>
            Configure quais arquivos incluir no pacote ZIP
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Site URL */}
          <div className="space-y-2">
            <Label htmlFor="siteUrl" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              URL do Site (para sitemap e SEO)
            </Label>
            <Input
              id="siteUrl"
              value={options.siteUrl}
              onChange={(e) => updateOption("siteUrl", e.target.value)}
              placeholder="https://seusite.com"
            />
            <p className="text-xs text-muted-foreground">
              Esta URL será usada no sitemap.xml e meta tags
            </p>
          </div>

          <Separator />

          {/* File Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Arquivos Extras</Label>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="readme"
                  checked={options.includeReadme}
                  onCheckedChange={(checked) => updateOption("includeReadme", !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="readme" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-blue-500" />
                    README.md
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Instruções de deploy e documentação
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="htaccess"
                  checked={options.includeHtaccess}
                  onCheckedChange={(checked) => updateOption("includeHtaccess", !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="htaccess" className="flex items-center gap-2 cursor-pointer">
                    <Shield className="h-4 w-4 text-green-500" />
                    .htaccess
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Compressão GZIP e cache para Apache
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="sitemap"
                  checked={options.includeSitemap}
                  onCheckedChange={(checked) => updateOption("includeSitemap", !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="sitemap" className="flex items-center gap-2 cursor-pointer">
                    <Map className="h-4 w-4 text-orange-500" />
                    sitemap.xml
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mapa do site para SEO e indexação
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="compiled"
                  checked={options.includeCompiled}
                  onCheckedChange={(checked) => updateOption("includeCompiled", !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="compiled" className="flex items-center gap-2 cursor-pointer">
                    <FileCode className="h-4 w-4 text-purple-500" />
                    compiled.html
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Versão única com CSS/JS inline
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="favicon"
                  checked={options.includeFavicon}
                  onCheckedChange={(checked) => updateOption("includeFavicon", !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="favicon" className="flex items-center gap-2 cursor-pointer">
                    <Image className="h-4 w-4 text-pink-500" />
                    favicon.svg
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Ícone SVG gerado automaticamente
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de arquivos</span>
              <span className="font-semibold">{totalFiles}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Arquivos do projeto</span>
              <span className="text-sm">{filesCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Arquivos extras</span>
              <span className="text-sm">{extraFilesCount}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancelar
          </Button>
          <Button onClick={() => onExport(options)} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando ZIP...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar ZIP
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
