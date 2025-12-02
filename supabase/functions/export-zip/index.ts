import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportOptions {
  includeReadme: boolean;
  includeHtaccess: boolean;
  includeSitemap: boolean;
  includeCompiled: boolean;
  includeFavicon: boolean;
  siteUrl: string;
}

const defaultOptions: ExportOptions = {
  includeReadme: true,
  includeHtaccess: true,
  includeSitemap: true,
  includeCompiled: true,
  includeFavicon: true,
  siteUrl: "https://seusite.com",
};

function extractPreservedHead(html: string): string {
  const metaRegex = /<meta[^>]+>/gi;
  const linkFontsRegex = /<link[^>]+(fonts|preconnect)[^>]*>/gi;
  const titleRegex = /<title>[^<]*<\/title>/gi;
  
  const metas = html.match(metaRegex) || [];
  const fontLinks = html.match(linkFontsRegex) || [];
  const title = html.match(titleRegex) || [];
  
  return [...metas, ...fontLinks, ...title].join('\n    ');
}

function generateReadme(projectName: string, filesCount: number): string {
  return `# ${projectName}

Site gerado automaticamente pelo PHPVibe.

## 📁 Estrutura de Arquivos

Este pacote contém ${filesCount} arquivos organizados da seguinte forma:

\`\`\`
${projectName}/
├── index.html          # Página principal
├── compiled.html       # Versão única (CSS/JS inline)
├── css/               # Arquivos de estilo
├── js/                # Scripts JavaScript
├── components/        # Componentes HTML reutilizáveis
├── robots.txt         # Configuração para motores de busca
├── sitemap.xml        # Mapa do site para SEO
├── .htaccess          # Configurações Apache (cache, GZIP)
└── favicon.svg        # Ícone do site
\`\`\`

## 🚀 Como fazer deploy

### Opção 1: Hospedagem Compartilhada (Hostinger, HostGator, Locaweb)

1. Acesse o painel de controle da sua hospedagem
2. Abra o **Gerenciador de Arquivos** ou use **FTP**
3. Navegue até a pasta \`public_html\`
4. Faça upload de **todos os arquivos** deste pacote
5. Certifique-se de que \`index.html\` está na raiz

### Opção 2: Netlify (Gratuito)

1. Acesse [netlify.com](https://netlify.com)
2. Arraste esta pasta para o painel
3. Pronto! Você receberá um link público

### Opção 3: Vercel (Gratuito)

1. Acesse [vercel.com](https://vercel.com)
2. Importe como projeto estático
3. Deploy automático

### Opção 4: GitHub Pages (Gratuito)

1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Ative GitHub Pages nas configurações

## ⚙️ Configurações Incluídas

- **robots.txt**: Permite indexação por motores de busca
- **sitemap.xml**: Lista todas as páginas para SEO
- **.htaccess**: Compressão GZIP e cache (servidores Apache)
- **compiled.html**: Versão standalone com tudo inline

## 📝 Personalização

Edite o arquivo \`sitemap.xml\` e substitua \`https://seusite.com\` pela URL real do seu site.

---

Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
Powered by PHPVibe 4.0
`;
}

function generateRobotsTxt(siteUrl: string): string {
  return `# robots.txt gerado pelo PHPVibe
# https://www.robotstxt.org/

User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Bloquear pastas de sistema (se houver)
Disallow: /admin/
Disallow: /private/
`;
}

function generateHtaccess(): string {
  return `# .htaccess gerado pelo PHPVibe
# Configurações para servidores Apache

# ============================================
# COMPRESSÃO GZIP
# ============================================
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

# ============================================
# CACHE DE ARQUIVOS ESTÁTICOS
# ============================================
<IfModule mod_expires.c>
  ExpiresActive On
  
  # HTML - cache curto (pode mudar frequentemente)
  ExpiresByType text/html "access plus 1 hour"
  
  # CSS e JS - cache médio
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  
  # Imagens - cache longo
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"
  
  # Fontes - cache longo
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# ============================================
# SEGURANÇA BÁSICA
# ============================================
# Esconder versão do servidor
ServerSignature Off

# Prevenir listagem de diretórios
Options -Indexes

# Proteger arquivos sensíveis
<FilesMatch "^\\.(htaccess|htpasswd|ini|log|sh|sql)$">
  Order Allow,Deny
  Deny from all
</FilesMatch>

# ============================================
# REDIRECIONAMENTO HTTPS (descomente se necessário)
# ============================================
# RewriteEngine On
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# ============================================
# WWW PARA NÃO-WWW (descomente se preferir)
# ============================================
# RewriteEngine On
# RewriteCond %{HTTP_HOST} ^www\\.(.*)$ [NC]
# RewriteRule ^(.*)$ https://%1/$1 [R=301,L]
`;
}

function generateSitemap(siteUrl: string, htmlFiles: { file_path: string }[]): string {
  const today = new Date().toISOString().split('T')[0];
  
  const urls = htmlFiles
    .filter(f => f.file_path.endsWith('.html') && !f.file_path.includes('components/'))
    .map(f => {
      const path = f.file_path === 'index.html' ? '' : f.file_path;
      const priority = f.file_path === 'index.html' ? '1.0' : '0.8';
      return `  <url>
    <loc>${siteUrl}/${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('\n')}
</urlset>`;
}

function generateFavicon(projectName: string, primaryColor: string = "#7C3AED"): string {
  const initial = projectName.charAt(0).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primaryColor}"/>
      <stop offset="100%" style="stop-color:#C026D3"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#bg)"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" 
        font-family="system-ui, -apple-system, sans-serif" 
        font-size="50" font-weight="600" fill="white">
    ${initial}
  </text>
</svg>`;
}

function generateCompiledHtml(
  projectName: string,
  indexContent: string,
  cssContent: string,
  jsContent: string,
  siteUrl: string,
  description: string = ""
): string {
  const preservedHead = extractPreservedHead(indexContent);
  
  // Extract body content
  let bodyContent = indexContent
    .replace(/<html[^>]*>/gi, "")
    .replace(/<\/html>/gi, "")
    .replace(/<head>[\s\S]*?<\/head>/gi, "")
    .replace(/<!DOCTYPE[^>]*>/gi, "")
    .replace(/<body[^>]*>/gi, "")
    .replace(/<\/body>/gi, "")
    .trim();

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${description || projectName}">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${siteUrl}">
    <meta property="og:title" content="${projectName}">
    <meta property="og:description" content="${description || projectName}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${siteUrl}">
    <meta name="twitter:title" content="${projectName}">
    <meta name="twitter:description" content="${description || projectName}">
    
    <!-- Canonical -->
    <link rel="canonical" href="${siteUrl}">
    
    <!-- Favicon -->
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    
    ${preservedHead}
    
    <title>${projectName}</title>
    
    <style>
${cssContent}
    </style>
</head>
<body>
${bodyContent}

    <!-- Schema.org JSON-LD -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "${projectName}",
        "url": "${siteUrl}",
        "description": "${description || projectName}"
    }
    </script>

    <script>
${jsContent}
    </script>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, projectName, projectDescription, options } = await req.json();

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    const exportOptions: ExportOptions = { ...defaultOptions, ...options };
    
    console.log("Exporting project:", projectId);
    console.log("Options:", exportOptions);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all files for this project
    const { data: files, error } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .order("file_path");

    if (error) {
      throw error;
    }

    if (!files || files.length === 0) {
      throw new Error("No files found for this project");
    }

    console.log("Found files:", files.length);

    // Create ZIP
    const zip = new JSZip();
    const folderName = (projectName || "website").toLowerCase().replace(/\s+/g, "-");

    // Process files
    let indexContent = "";
    let cssContent = "";
    let jsContent = "";
    const componentsMap: Record<string, string> = {};

    // First pass: collect all content
    for (const file of files) {
      if (file.file_path.startsWith("components/")) {
        const componentName = file.file_name.replace(".html", "");
        componentsMap[componentName] = file.content;
      }
      if (file.file_type === "css") {
        cssContent += `/* ${file.file_name} */\n${file.content}\n\n`;
      }
      if (file.file_type === "js") {
        jsContent += `/* ${file.file_name} */\n${file.content}\n\n`;
      }
    }

    // Second pass: add files to ZIP with component replacement
    for (const file of files) {
      let content = file.content;

      // If it's index.html, replace component placeholders
      if (file.file_path === "index.html") {
        for (const [name, componentContent] of Object.entries(componentsMap)) {
          const placeholder = new RegExp(`{{\\s*${name}\\s*}}`, "gi");
          content = content.replace(placeholder, componentContent);
        }
        indexContent = content;
      }

      zip.file(`${folderName}/${file.file_path}`, content);
    }

    // Generate extra files based on options
    const siteUrl = exportOptions.siteUrl || defaultOptions.siteUrl;

    if (exportOptions.includeReadme) {
      zip.file(`${folderName}/README.md`, generateReadme(projectName || "Website", files.length));
    }

    if (exportOptions.includeHtaccess) {
      zip.file(`${folderName}/.htaccess`, generateHtaccess());
    }

    if (exportOptions.includeSitemap) {
      zip.file(`${folderName}/sitemap.xml`, generateSitemap(siteUrl, files));
    }

    // Always include robots.txt
    zip.file(`${folderName}/robots.txt`, generateRobotsTxt(siteUrl));

    if (exportOptions.includeFavicon) {
      zip.file(`${folderName}/favicon.svg`, generateFavicon(projectName || "W"));
    }

    // Generate compiled HTML
    if (exportOptions.includeCompiled && indexContent) {
      const compiledHtml = generateCompiledHtml(
        projectName || "Website",
        indexContent,
        cssContent,
        jsContent,
        siteUrl,
        projectDescription
      );
      zip.file(`${folderName}/compiled.html`, compiledHtml);
    }

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: "base64" });

    const totalFiles = files.length + 
      (exportOptions.includeReadme ? 1 : 0) +
      (exportOptions.includeHtaccess ? 1 : 0) +
      (exportOptions.includeSitemap ? 1 : 0) +
      (exportOptions.includeFavicon ? 1 : 0) +
      (exportOptions.includeCompiled ? 1 : 0) +
      1; // robots.txt

    console.log("ZIP generated successfully with", totalFiles, "files");

    return new Response(
      JSON.stringify({
        success: true,
        zipData: zipBlob,
        filename: `${folderName}.zip`,
        filesCount: totalFiles,
        includedExtras: {
          readme: exportOptions.includeReadme,
          htaccess: exportOptions.includeHtaccess,
          sitemap: exportOptions.includeSitemap,
          compiled: exportOptions.includeCompiled,
          favicon: exportOptions.includeFavicon,
          robots: true,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in export-zip:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
