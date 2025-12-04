import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

async function fetchContentMemories(supabase: any): Promise<string> {
  try {
    const { data: memories } = await supabase
      .from("ai_memories")
      .select("title, content")
      .eq("is_active", true)
      .or("agent.eq.content_personalizer,agent.eq.all,agent.is.null")
      .order("priority", { ascending: false });

    if (!memories || memories.length === 0) return "";

    return memories
      .map((m: any) => `### ${m.title}\n${m.content}`)
      .join("\n\n");
  } catch {
    return "";
  }
}

function buildBusinessDataContext(projectSettings: any): string {
  if (!projectSettings) return "Nenhum dado de negócio disponível.";

  const parts: string[] = [];

  if (projectSettings.company_name) {
    parts.push(`Nome da Empresa: ${projectSettings.company_name}`);
  }
  if (projectSettings.slogan) {
    parts.push(`Slogan: ${projectSettings.slogan}`);
  }
  if (projectSettings.phone) {
    parts.push(`Telefone: ${projectSettings.phone}`);
  }
  if (projectSettings.whatsapp) {
    parts.push(`WhatsApp: ${projectSettings.whatsapp}`);
  }
  if (projectSettings.email) {
    parts.push(`Email: ${projectSettings.email}`);
  }
  if (projectSettings.address) {
    const fullAddress = [
      projectSettings.address,
      projectSettings.city,
      projectSettings.state,
      projectSettings.zip_code,
    ].filter(Boolean).join(", ");
    parts.push(`Endereço: ${fullAddress}`);
  }

  if (projectSettings.social_links) {
    const social = projectSettings.social_links;
    const socialParts: string[] = [];
    if (social.instagram) socialParts.push(`Instagram: ${social.instagram}`);
    if (social.facebook) socialParts.push(`Facebook: ${social.facebook}`);
    if (social.linkedin) socialParts.push(`LinkedIn: ${social.linkedin}`);
    if (social.youtube) socialParts.push(`YouTube: ${social.youtube}`);
    if (social.tiktok) socialParts.push(`TikTok: ${social.tiktok}`);
    if (social.twitter) socialParts.push(`Twitter/X: ${social.twitter}`);
    if (socialParts.length > 0) {
      parts.push(`Redes Sociais:\n${socialParts.join("\n")}`);
    }
  }

  if (projectSettings.business_hours) {
    const hours = projectSettings.business_hours;
    const hoursParts: string[] = [];
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const dayNames: Record<string, string> = {
      monday: "Segunda",
      tuesday: "Terça",
      wednesday: "Quarta",
      thursday: "Quinta",
      friday: "Sexta",
      saturday: "Sábado",
      sunday: "Domingo",
    };
    days.forEach((day) => {
      if (hours[day]) {
        hoursParts.push(`${dayNames[day]}: ${hours[day]}`);
      }
    });
    if (hoursParts.length > 0) {
      parts.push(`Horário de Funcionamento:\n${hoursParts.join("\n")}`);
    }
  }

  if (projectSettings.custom_fields) {
    const custom = projectSettings.custom_fields;
    const customParts: string[] = [];
    Object.entries(custom).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim()) {
        customParts.push(`${key}: ${value}`);
      }
    });
    if (customParts.length > 0) {
      parts.push(`Dados Adicionais:\n${customParts.join("\n")}`);
    }
  }

  return parts.length > 0 ? parts.join("\n\n") : "Nenhum dado de negócio disponível.";
}

const systemPrompt = `Você é um especialista em personalização de templates HTML.

Sua tarefa é substituir textos genéricos/placeholder por dados reais do negócio fornecidos.

## REGRAS ABSOLUTAS:

1. **NÃO ALTERE** a estrutura HTML, classes CSS, IDs, ou atributos data-*
2. **NÃO ALTERE** nenhum código JavaScript ou CSS inline
3. **NÃO ALTERE** URLs de imagens, fontes, ou CDNs
4. **APENAS SUBSTITUA** textos de conteúdo visível dentro de tags HTML

## O QUE SUBSTITUIR:

- Nomes de empresa genéricos ("Empresa XYZ", "Nome da Empresa", "Company Name") → Nome real
- Telefones placeholder ("(00) 0000-0000", "000-000-0000") → Telefone real
- Emails placeholder ("email@exemplo.com", "contato@empresa.com") → Email real
- Endereços genéricos ("Rua Exemplo, 123") → Endereço real
- Slogans placeholder ("Seu slogan aqui", "Tagline") → Slogan real
- Textos Lorem Ipsum → Texto relevante para o tipo de negócio
- Horários placeholder → Horários reais de funcionamento
- Redes sociais placeholder → Links reais das redes sociais

## PRESERVAR INTACTO:

- Todas as classes CSS (class="...")
- Todos os IDs (id="...")
- Todos os atributos data-* (data-lucide, data-aos, etc.)
- Todas as tags <script> e seu conteúdo
- Todas as tags <style> e seu conteúdo
- Todos os links de CDN e recursos externos
- Estrutura de tags HTML (divs, sections, etc.)
- Atributos href="#" ou links de âncora
- Meta tags (serão tratadas separadamente)

## FORMATO DE RESPOSTA:

Retorne um JSON com a seguinte estrutura:
{
  "files": [
    {
      "path": "caminho/do/arquivo.html",
      "name": "arquivo.html",
      "type": "html",
      "content": "conteúdo HTML completo personalizado"
    }
  ]
}

IMPORTANTE: Retorne TODOS os arquivos recebidos, mesmo os não-HTML (CSS, JS) sem modificações.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files, projectSettings, briefing } = await req.json();

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Nenhum arquivo fornecido" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const memoriesContext = await fetchContentMemories(supabase);
    const businessContext = buildBusinessDataContext(projectSettings);

    // Only process HTML files, pass others through
    const htmlFiles = files.filter((f: any) => f.type === "html");
    const otherFiles = files.filter((f: any) => f.type !== "html");

    if (htmlFiles.length === 0) {
      console.log("No HTML files to personalize, returning original files");
      return new Response(
        JSON.stringify({ success: true, files }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const filesDescription = htmlFiles
      .map((f: any) => `### ${f.path}\n\`\`\`html\n${f.content}\n\`\`\``)
      .join("\n\n");

    const userPrompt = `## Dados do Negócio:

${businessContext}

## Briefing do Projeto:
${briefing || "Não fornecido"}

## Arquivos HTML para Personalizar:

${filesDescription}

Personalize os textos genéricos com os dados reais do negócio fornecidos acima.
Mantenha toda estrutura HTML, CSS e JS intactos.
Retorne o JSON com todos os arquivos.`;

    const fullSystemPrompt = memoriesContext
      ? `${systemPrompt}\n\n## Contexto Adicional:\n${memoriesContext}`
      : systemPrompt;

    console.log("Calling OpenAI for template personalization...");
    console.log("HTML files to personalize:", htmlFiles.length);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
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
    const personalizedHtmlFiles = parsed.files || [];

    // Combine personalized HTML files with unchanged other files
    const allFiles = [...personalizedHtmlFiles, ...otherFiles];

    console.log("Personalization complete. Files:", allFiles.length);

    return new Response(
      JSON.stringify({ success: true, files: allFiles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in personalize-template:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
