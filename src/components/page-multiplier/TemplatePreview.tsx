import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface TemplatePreviewProps {
  content: string;
  tags: string[];
}

export function TemplatePreview({ content, tags }: TemplatePreviewProps) {
  if (!content) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <Eye className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Selecione um template para ver o preview
        </p>
      </div>
    );
  }

  // Highlight tags in content
  const highlightTags = (text: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      // Add highlighted tag
      parts.push(
        <Badge
          key={match.index}
          variant="default"
          className="mx-0.5 bg-primary/20 text-primary hover:bg-primary/30"
        >
          {match[0]}
        </Badge>
      );
      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  // Extract text content from HTML for preview
  const getPreviewText = (html: string) => {
    // Simple extraction - get text between body tags or full content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const content = bodyMatch ? bodyMatch[1] : html;
    
    // Remove script and style tags
    const cleaned = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return cleaned.slice(0, 500) + (cleaned.length > 500 ? "..." : "");
  };

  const previewText = getPreviewText(content);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Preview do Template
        </label>
        <span className="text-xs text-muted-foreground">
          {tags.length} tag{tags.length !== 1 ? "s" : ""} encontrada{tags.length !== 1 ? "s" : ""}
        </span>
      </div>
      <ScrollArea className="h-[120px] rounded-lg border border-border bg-muted/30 p-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {highlightTags(previewText)}
        </p>
      </ScrollArea>
    </div>
  );
}
