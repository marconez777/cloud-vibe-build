import { useMemo } from "react";
import type { ProjectFile } from "@/types/project-files";

interface FilePreviewProps {
  files: ProjectFile[];
}

export function FilePreview({ files }: FilePreviewProps) {
  const compiledHtml = useMemo(() => {
    if (!files || files.length === 0) return "";

    // Find index.html
    const indexFile = files.find((f) => f.file_path === "index.html");
    if (!indexFile) return "";

    // Get components
    const componentsMap: Record<string, string> = {};
    for (const file of files) {
      if (file.file_path.startsWith("components/")) {
        const componentName = file.file_name.replace(".html", "");
        componentsMap[componentName] = file.content;
      }
    }

    // Replace placeholders in index.html (support both formats)
    let html = indexFile.content;
    for (const [name, content] of Object.entries(componentsMap)) {
      // Format 1: {{ header }} - mustache style
      const mustachePlaceholder = new RegExp(`{{\\s*${name}\\s*}}`, "gi");
      html = html.replace(mustachePlaceholder, content);
      
      // Format 2: <div id="header-placeholder"></div> - element style
      const elementPlaceholder = new RegExp(
        `<div[^>]*id=["']${name}-placeholder["'][^>]*>\\s*</div>`,
        "gi"
      );
      html = html.replace(elementPlaceholder, content);
    }

    // Collect CSS
    let cssContent = "";
    for (const file of files) {
      if (file.file_type === "css") {
        cssContent += file.content + "\n";
      }
    }

    // Collect JS
    let jsContent = "";
    for (const file of files) {
      if (file.file_type === "js" || file.file_type === "javascript") {
        jsContent += file.content + "\n";
      }
    }

    // Build full HTML document
    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${cssContent}</style>
</head>
<body>
${html.replace(/<html[^>]*>|<\/html>|<head>[\s\S]*?<\/head>|<!DOCTYPE[^>]*>/gi, "").replace(/<body[^>]*>|<\/body>/gi, "").trim()}
<script>${jsContent}</script>
</body>
</html>`;

    return fullHtml;
  }, [files]);

  if (!compiledHtml) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">Nenhum arquivo para visualizar</p>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={compiledHtml}
      className="block h-full w-full border-0"
      title="Preview"
      sandbox="allow-scripts"
    />
  );
}
