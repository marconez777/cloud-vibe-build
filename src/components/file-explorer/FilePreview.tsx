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

    // Get the original HTML content
    let html = indexFile.content;

    // Get components for placeholder replacement
    const componentsMap: Record<string, string> = {};
    for (const file of files) {
      if (file.file_path.startsWith("components/")) {
        const componentName = file.file_name.replace(".html", "");
        componentsMap[componentName] = file.content;
      }
    }

    // Replace placeholders (support both formats)
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

    // Check if the HTML already has complete structure (with <!DOCTYPE> and <html>)
    const hasDoctype = /<!DOCTYPE\s+html>/i.test(html);
    const hasHtmlTag = /<html[^>]*>/i.test(html);
    
    if (hasDoctype && hasHtmlTag) {
      // The HTML is already complete - inject external CSS/JS files only
      let finalHtml = html;

      // Collect additional CSS from separate files
      let additionalCss = "";
      for (const file of files) {
        if (file.file_type === "css" && file.file_path !== "index.html") {
          additionalCss += `/* ${file.file_name} */\n${file.content}\n`;
        }
      }

      // Collect additional JS from separate files
      let additionalJs = "";
      for (const file of files) {
        if ((file.file_type === "js" || file.file_type === "javascript") && file.file_path !== "index.html") {
          additionalJs += `/* ${file.file_name} */\n${file.content}\n`;
        }
      }

      // Inject additional CSS before </head>
      if (additionalCss) {
        finalHtml = finalHtml.replace(
          /<\/head>/i,
          `<style>${additionalCss}</style>\n</head>`
        );
      }

      // Inject additional JS before </body>
      if (additionalJs) {
        finalHtml = finalHtml.replace(
          /<\/body>/i,
          `<script>${additionalJs}</script>\n</body>`
        );
      }

      return finalHtml;
    }

    // Fallback: Build full HTML document from partial content
    // Extract existing head content if present
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    const existingHead = headMatch ? headMatch[1] : "";
    
    // Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch 
      ? bodyMatch[1] 
      : html.replace(/<html[^>]*>|<\/html>|<head>[\s\S]*?<\/head>|<!DOCTYPE[^>]*>/gi, "").trim();

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

    // Build full HTML document preserving original head content
    const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${existingHead}
  ${cssContent ? `<style>${cssContent}</style>` : ""}
</head>
<body>
${bodyContent}
${jsContent ? `<script>${jsContent}</script>` : ""}
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
