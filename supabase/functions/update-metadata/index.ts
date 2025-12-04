import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

async function fetchSEOMemories(supabase: any): Promise<string> {
  try {
    const { data: memories } = await supabase
      .from("ai_memories")
      .select("title, content")
      .eq("is_active", true)
      .or("agent.eq.seo_specialist,agent.eq.metadata_specialist,agent.eq.all,agent.is.null")
      .order("priority", { ascending: false });

    if (!memories || memories.length === 0) return "";

    return memories
      .map((m: any) => `### ${m.title}\n${m.content}`)
      .join("\n\n");
  } catch {
    return "";
  }
}

function buildBusinessContext(projectSettings: any): string {
  if (!projectSettings) return "";

  const parts: string[] = [];

  if (projectSettings.company_name) {
    parts.push(`Empresa: ${projectSettings.company_name}`);
  }
  if (projectSettings.slogan) {
    parts.push(`Slogan: ${projectSettings.slogan}`);
  }
  if (projectSettings.city && projectSettings.state) {
    parts.push(`Localização: ${projectSettings.city}, ${projectSettings.state}`);
  }
  if (projectSettings.phone) {
    parts.push(`Telefone: ${projectSettings.phone}`);
  }

  const customFields = projectSettings.custom_fields as Record<string, any> | null;
  if (customFields?.seo) {
    const seo = customFields.seo;
    if (seo.keywords) parts.push(`Palavras-chave: ${seo.keywords}`);
    if (seo.canonical_url) parts.push(`URL Canônica: ${seo.canonical_url}`);
    if (seo.service_area) parts.push(`Área de Atendimento: ${seo.service_area}`);
  }

  return parts.join("\n");
}

const systemPrompt = `Você é um especialista em SEO e metadados HTML.

Sua tarefa é atualizar APENAS os metadados dos arquivos HTML para melhorar SEO.

## ALTERAÇÕES PERMITIDAS:

1. **<title>** - Atualizar com nome da empresa + descrição da página (50-60 caracteres)
2. **<meta name="description">** - Descrição otimizada (150-160 caracteres)
3. **<meta name="keywords">** - Palavras-chave relevantes
4. **<meta property="og:*">** - Open Graph para compartilhamento social
5. **<meta name="twitter:*">** - Twitter Cards
6. **<link rel="canonical">** - URL canônica
7. **<script type="application/ld+json">** - Schema.org JSON-LD

## NÃO ALTERAR:

- Conteúdo visível da página (textos, imagens)
- Estrutura HTML do body
- Classes CSS ou estilos
- JavaScript funcional
- Links de navegação

## SCHEMA.ORG OBRIGATÓRIO:

Para LocalBusiness/Organization:
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Nome da Empresa",
  "description": "Descrição",
  "telephone": "Telefone",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Endereço",
    "addressLocality": "Cidade",
    "addressRegion": "Estado"
  }
}

## META TAGS PADRÃO:

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index, follow">
<meta name="author" content="Nome da Empresa">

## FORMATO DE RESPOSTA:

{
  "files": [
    {
      "path": "index.html",
      "name": "index.html",
      "type": "html",
      "content": "HTML completo com metadados atualizados"
    }
  ]
}

Retorne TODOS os arquivos, incluindo não-HTML sem modificações.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files, projectSettings } = await req.json();

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Nenhum arquivo fornecido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const memoriesContext = await fetchSEOMemories(supabase);
    const businessContext = buildBusinessContext(projectSettings);

    // Only process HTML files
    const htmlFiles = files.filter((f: any) => f.type === "html");
    const otherFiles = files.filter((f: any) => f.type !== "html");

    if (htmlFiles.length === 0) {
      console.log("No HTML files to update metadata, returning original files");
      return new Response(
        JSON.stringify({ success: true, files }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const filesDescription = htmlFiles
      .map((f: any) => `### ${f.path}\n\`\`\`html\n${f.content}\n\`\`\``)
      .join("\n\n");

    const userPrompt = `## Dados do Negócio para SEO:

${businessContext}

## Arquivos HTML para Atualizar Metadados:

${filesDescription}

Atualize os metadados SEO (title, meta description, Open Graph, Twitter Cards, Schema.org) com base nos dados do negócio.
Mantenha todo o conteúdo visível da página intacto.
Retorne o JSON com todos os arquivos.`;

    const fullSystemPrompt = memoriesContext
      ? `${systemPrompt}\n\n## Diretrizes SEO Adicionais:\n${memoriesContext}`
      : systemPrompt;

    console.log("Calling OpenAI for metadata update...");
    console.log("HTML files to update:", htmlFiles.length);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices?.[0]?.finish_reason === "length") {
      console.warn("Response was truncated due to length");
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const parsed = JSON.parse(content);
    const updatedHtmlFiles = parsed.files || [];

    // Combine updated HTML files with unchanged other files
    const allFiles = [...updatedHtmlFiles, ...otherFiles];

    console.log("Metadata update complete. Files:", allFiles.length);

    return new Response(
      JSON.stringify({ success: true, files: allFiles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in update-metadata:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
