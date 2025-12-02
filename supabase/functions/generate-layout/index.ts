import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é um especialista em design de websites. Sua tarefa é gerar um layout estruturado (LayoutTree) baseado no briefing do usuário.

IMPORTANTE: Retorne APENAS um JSON válido, sem markdown, sem explicações, sem código fence.

O formato do LayoutTree deve ser:
{
  "id": "layout-[uuid]",
  "name": "Nome do Site",
  "pages": [
    {
      "id": "page-[uuid]",
      "name": "Home",
      "slug": "/",
      "isHomepage": true,
      "sections": [
        {
          "id": "section-[uuid]",
          "type": "hero|services|features|about|stats|testimonials|team|pricing|faq|gallery|blog|contact|cta|footer",
          "content": { ... conteúdo específico da seção ... }
        }
      ]
    }
  ],
  "globalStyles": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex", 
    "fontFamily": "font-name",
    "headingFont": "font-name"
  }
}

Tipos de seção disponíveis e seus conteúdos:
- hero: { headline, subheadline, ctaText, backgroundImage? }
- services: { title, subtitle, services: [{title, description}] }
- features: { title, subtitle, features: [{title, description}] }
- about: { title, description, stats: [{label, value}] }
- stats: { stats: [{value, label}] }
- testimonials: { title, testimonials: [{name, role, content}] }
- team: { title, subtitle, members: [{name, role}] }
- pricing: { title, subtitle, plans: [{name, price, period, features: [], highlighted?}] }
- faq: { title, faqs: [{question, answer}] }
- gallery: { title, images: [{src, alt}] }
- blog: { title, posts: [{title, excerpt, date}] }
- contact: { title, subtitle, email, phone, address }
- cta: { title, subtitle, ctaText }
- footer: { companyName, description, links: [{title, items: [{label, href}]}], copyright }

Diretrizes:
1. Analise o briefing para entender o tipo de negócio
2. Escolha cores apropriadas para o segmento
3. Selecione as seções mais relevantes para o tipo de site
4. Preencha o conteúdo de forma realista e profissional
5. Use IDs únicos no formato "tipo-uuid" (ex: "section-abc123")
6. Gere um site completo e funcional

SEMPRE inclua: hero, pelo menos 2-3 seções de conteúdo, contact e footer.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { projectId, briefing, messages } = await req.json();
    console.log("Generating layout for project:", projectId);
    console.log("Briefing:", briefing);

    // Build conversation for context
    const conversationMessages = [
      { role: "system", content: systemPrompt },
    ];

    if (briefing) {
      conversationMessages.push({
        role: "user",
        content: `Briefing do projeto:\n${briefing}\n\nGere o LayoutTree completo para este site.`,
      });
    }

    // Add conversation history if exists
    if (messages && messages.length > 0) {
      for (const msg of messages) {
        conversationMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    console.log("Calling Lovable AI...");
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: conversationMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    console.log("AI response received");

    // Try to extract JSON from response
    let layoutTree = null;
    let responseText = aiResponse;

    try {
      // Try to parse directly
      layoutTree = JSON.parse(aiResponse);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          layoutTree = JSON.parse(jsonMatch[1].trim());
        } catch (e) {
          console.error("Failed to parse JSON from code block:", e);
        }
      }
    }

    // If we have a layout tree, update the project
    if (layoutTree && projectId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Update project with layout tree
      const { error: updateError } = await supabase
        .from("projects")
        .update({ 
          layout_tree: layoutTree,
          status: "ready",
        })
        .eq("id", projectId);

      if (updateError) {
        console.error("Error updating project:", updateError);
      } else {
        console.log("Project updated successfully");

        // Create a version
        const { error: versionError } = await supabase
          .from("layout_versions")
          .insert({
            project_id: projectId,
            layout_tree: layoutTree,
            commit_message: "Layout gerado pela IA",
            created_by: "ai",
          });

        if (versionError) {
          console.error("Error creating version:", versionError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        layoutTree,
        message: responseText,
        success: !!layoutTree,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-layout:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
