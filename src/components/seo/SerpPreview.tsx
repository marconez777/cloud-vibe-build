import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ExternalLink } from "lucide-react";

interface SerpPreviewProps {
  htmlContent: string;
  siteUrl?: string;
}

export function SerpPreview({ htmlContent, siteUrl = "www.example.com" }: SerpPreviewProps) {
  const serpData = useMemo(() => {
    if (!htmlContent) return null;
    
    // Extract title
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
    let title = titleMatch?.[1] || "Título não encontrado";
    
    // Truncate title if needed (Google typically shows ~60 chars)
    if (title.length > 60) {
      title = title.substring(0, 57) + "...";
    }
    
    // Extract description
    const descMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    let description = descMatch?.[1] || "Nenhuma descrição encontrada. Adicione uma meta description para melhorar o CTR nos resultados de busca.";
    
    // Truncate description if needed (Google typically shows ~160 chars)
    if (description.length > 160) {
      description = description.substring(0, 157) + "...";
    }
    
    // Extract favicon
    const faviconMatch = htmlContent.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
    const favicon = faviconMatch?.[1] || null;
    
    return { title, description, favicon };
  }, [htmlContent]);

  if (!htmlContent || !serpData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Gere um site para visualizar o preview do Google
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5" />
          Preview no Google
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-card p-4">
          {/* Google-style result */}
          <div className="space-y-1">
            {/* URL line */}
            <div className="flex items-center gap-2 text-sm">
              {serpData.favicon ? (
                <img 
                  src={serpData.favicon} 
                  alt="" 
                  className="h-4 w-4 rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-4 w-4 rounded bg-muted flex items-center justify-center">
                  <Globe className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
              )}
              <span className="text-muted-foreground truncate">
                {siteUrl}
              </span>
            </div>
            
            {/* Title */}
            <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-normal leading-snug">
              {serpData.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {serpData.description}
            </p>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Assim seu site aparece nos resultados de busca do Google
        </p>
      </CardContent>
    </Card>
  );
}
