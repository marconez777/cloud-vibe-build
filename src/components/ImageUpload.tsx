import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function ImageUpload({
  onImagesChange,
  maxFiles = 5,
  maxSize = 10,
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    console.log("Uploading file:", file.name, file.type, file.size);
    
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo ${maxSize}MB`);
      return null;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são permitidas");
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `references/${fileName}`;

    console.log("Uploading to path:", filePath);

    const { data, error } = await supabase.storage
      .from("project-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (error) {
      console.error("Upload error:", error.message, error);
      toast.error(`Erro: ${error.message}`);
      return null;
    }

    console.log("Upload success:", data);

    const { data: publicUrl } = supabase.storage
      .from("project-assets")
      .getPublicUrl(filePath);

    console.log("Public URL:", publicUrl.publicUrl);
    return publicUrl.publicUrl;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    console.log("handleFiles called with", fileArray.length, "files");
    
    if (fileArray.length === 0) {
      console.log("No files selected");
      return;
    }
    
    if (images.length + fileArray.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} imagens`);
      return;
    }

    setIsUploading(true);
    toast.info("Iniciando upload...");

    const uploadPromises = fileArray.map(uploadFile);
    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((url): url is string => url !== null);

    console.log("Upload results:", successfulUploads);

    if (successfulUploads.length > 0) {
      const newImages = [...images, ...successfulUploads];
      setImages(newImages);
      onImagesChange(newImages);
      toast.success(`${successfulUploads.length} imagem(ns) enviada(s)`);
    } else {
      toast.error("Nenhuma imagem foi enviada. Verifique o console.");
    }

    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Enviando...</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Arraste imagens ou clique para upload
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG até {maxSize}MB ({maxFiles} máx)
            </p>
          </div>
        )}
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <img
                src={url}
                alt={`Referência ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
