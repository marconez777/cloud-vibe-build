import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { ProjectSettings, useUploadSettingsImage } from "@/hooks/useProjectSettings";

interface IdentityTabProps {
  settings: Partial<ProjectSettings>;
  onChange: (settings: Partial<ProjectSettings>) => void;
  projectId: string;
}

export function IdentityTab({ settings, onChange, projectId }: IdentityTabProps) {
  const uploadMutation = useUploadSettingsImage();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadMutation.mutateAsync({ file, path: `${projectId}/logo` });
      onChange({ ...settings, logo_url: url });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    try {
      const url = await uploadMutation.mutateAsync({ file, path: `${projectId}/favicon` });
      onChange({ ...settings, favicon_url: url });
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploadingGallery(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadMutation.mutateAsync({ file, path: `${projectId}/gallery` });
        newUrls.push(url);
      }
      onChange({ 
        ...settings, 
        gallery_images: [...(settings.gallery_images || []), ...newUrls] 
      });
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...(settings.gallery_images || [])];
    newImages.splice(index, 1);
    onChange({ ...settings, gallery_images: newImages });
  };

  return (
    <div className="space-y-6">
      {/* Company Name & Slogan */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_name">Nome da Empresa</Label>
          <Input
            id="company_name"
            value={settings.company_name || ""}
            onChange={(e) => onChange({ ...settings, company_name: e.target.value })}
            placeholder="Minha Empresa LTDA"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slogan">Slogan</Label>
          <Input
            id="slogan"
            value={settings.slogan || ""}
            onChange={(e) => onChange({ ...settings, slogan: e.target.value })}
            placeholder="Qualidade e confiança"
          />
        </div>
      </div>

      {/* Logo Upload */}
      <Card>
        <CardContent className="pt-6">
          <Label className="mb-3 block">Logo da Empresa</Label>
          <div className="flex items-start gap-4">
            {settings.logo_url ? (
              <div className="relative">
                <img 
                  src={settings.logo_url} 
                  alt="Logo" 
                  className="h-24 w-24 rounded-lg border object-contain bg-background"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-6 w-6"
                  onClick={() => onChange({ ...settings, logo_url: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="logo-upload"
                onChange={handleLogoUpload}
              />
              <Button asChild variant="outline" disabled={uploadingLogo}>
                <label htmlFor="logo-upload" className="cursor-pointer">
                  {uploadingLogo ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {uploadingLogo ? "Enviando..." : "Upload Logo"}
                </label>
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                PNG, JPG ou SVG. Recomendado: 200x200px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favicon Upload */}
      <Card>
        <CardContent className="pt-6">
          <Label className="mb-3 block">Favicon</Label>
          <div className="flex items-start gap-4">
            {settings.favicon_url ? (
              <div className="relative">
                <img 
                  src={settings.favicon_url} 
                  alt="Favicon" 
                  className="h-12 w-12 rounded border object-contain bg-background"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-5 w-5"
                  onClick={() => onChange({ ...settings, favicon_url: null })}
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded border-2 border-dashed border-muted-foreground/25">
                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="favicon-upload"
                onChange={handleFaviconUpload}
              />
              <Button asChild variant="outline" size="sm" disabled={uploadingFavicon}>
                <label htmlFor="favicon-upload" className="cursor-pointer">
                  {uploadingFavicon ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {uploadingFavicon ? "Enviando..." : "Upload Favicon"}
                </label>
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                ICO, PNG ou SVG. Recomendado: 32x32px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Images */}
      <Card>
        <CardContent className="pt-6">
          <Label className="mb-3 block">Galeria de Imagens</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {settings.gallery_images?.map((url, index) => (
              <div key={index} className="group relative aspect-square">
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="h-full w-full rounded-lg border object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => removeGalleryImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="aspect-square">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="gallery-upload"
                onChange={handleGalleryUpload}
              />
              <label
                htmlFor="gallery-upload"
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                {uploadingGallery ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="mt-1 text-xs text-muted-foreground">Adicionar</span>
                  </>
                )}
              </label>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Adicione imagens do negócio, equipe, produtos ou serviços
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
