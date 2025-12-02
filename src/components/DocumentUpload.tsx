import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadedDocument {
  name: string;
  url: string;
  type: string;
  size: number;
}

interface DocumentUploadProps {
  onDocumentUploaded: (doc: { name: string; url: string; content?: string }) => void;
  maxSize?: number;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_EXTENSIONS = ["pdf", "txt", "md", "docx"];

export function DocumentUpload({
  onDocumentUploaded,
  maxSize = 10,
}: DocumentUploadProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const readTextContent = async (file: File): Promise<string | null> => {
    const ext = getFileExtension(file.name);
    
    if (ext === "txt" || ext === "md") {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      });
    }
    
    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedDocument | null> => {
    console.log("Uploading document:", file.name, file.type, file.size);

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo ${maxSize}MB`);
      return null;
    }

    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(`Tipo não suportado. Use: ${ALLOWED_EXTENSIONS.join(", ")}`);
      return null;
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = `knowledge/${fileName}`;

    const { data, error } = await supabase.storage
      .from("project-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error.message);
      toast.error(`Erro: ${error.message}`);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("project-assets")
      .getPublicUrl(filePath);

    const textContent = await readTextContent(file);

    const doc: UploadedDocument = {
      name: file.name,
      url: publicUrl.publicUrl,
      type: ext,
      size: file.size,
    };

    onDocumentUploaded({
      name: file.name,
      url: publicUrl.publicUrl,
      content: textContent || undefined,
    });

    return doc;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);
    toast.info("Enviando documentos...");

    for (const file of fileArray) {
      const result = await uploadFile(file);
      if (result) {
        setDocuments((prev) => [...prev, result]);
      }
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

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/50"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,.docx"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-sm font-medium">Enviando...</p>
          </div>
        ) : (
          <div className="text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">
              Arraste arquivos ou clique para upload
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, TXT, MD, DOCX até {maxSize}MB cada
            </p>
          </div>
        )}
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"
            >
              <File className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.type.toUpperCase()} • {formatSize(doc.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  removeDocument(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
