import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const generateSystemPrompt = `Você é um especialista em design de websites. Sua tarefa é gerar um layout estruturado (LayoutTree) baseado no briefing do usuário.

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
- hero: { headline, subheadline, ctaText, backgroundImage?, backgroundColor? }
- services: { title, subtitle, services: [{title, description, icon?}] }
- features: { title, subtitle, features: [{title, description, icon?}] }
- about: { title, description, stats: [{label, value}], backgroundColor? }
- stats: { stats: [{value, label}], backgroundColor? }
- testimonials: { title, testimonials: [{name, role, content, avatar?}] }
- team: { title, subtitle, members: [{name, role, image?}] }
- pricing: { title, subtitle, plans: [{name, price, period, features: [], highlighted?}] }
- faq: { title, faqs: [{question, answer}] }
- gallery: { title, images: [{src, alt}] }
- blog: { title, posts: [{title, excerpt, date, image?}] }
- contact: { title, subtitle, email, phone, address }
- cta: { title, subtitle, ctaText, backgroundColor? }
- footer: { companyName, description, links: [{title, items: [{label, href}]}], copyright }

Diretrizes:
1. Analise o briefing para entender o tipo de negócio
2. Escolha cores apropriadas para o segmento
3. Selecione as seções mais relevantes para o tipo de site
4. Preencha o conteúdo de forma realista e profissional
5. Use IDs únicos no formato "tipo-uuid" (ex: "section-abc123")
6. Gere um site completo e funcional

SEMPRE inclua: hero, pelo menos 2-3 seções de conteúdo, contact e footer.`;

const editSystemPrompt = `Você é um especialista em design de websites. Sua tarefa é MODIFICAR um layout existente baseado nas instruções do usuário.

REGRAS CRÍTICAS:
1. Retorne APENAS o JSON do LayoutTree completo modificado
2. NÃO retorne markdown, explicações ou código fence
3. MANTENHA todas as seções e estrutura que NÃO foram mencionadas
4. PRESERVE os IDs existentes das seções não modificadas
5. Gere novos IDs apenas para seções NOVAS

Tipos de modificações que você pode fazer:
- Alterar cores (primaryColor, secondaryColor, backgroundColor de seções)
- Alterar textos (headlines, subtitles, descrições)
- Adicionar/remover seções
- Adicionar/remover itens em listas (features, services, team members, etc.)
- Reordenar seções
- Alterar estilos de seções específicas

Tipos de seção disponíveis:
- hero: { headline, subheadline, ctaText, backgroundImage?, backgroundColor? }
- services: { title, subtitle, services: [{title, description, icon?}] }
- features: { title, subtitle, features: [{title, description, icon?}] }
- about: { title, description, stats: [{label, value}], backgroundColor? }
- stats: { stats: [{value, label}], backgroundColor? }
- testimonials: { title, testimonials: [{name, role, content, avatar?}] }
- team: { title, subtitle, members: [{name, role, image?}] }
- pricing: { title, subtitle, plans: [{name, price, period, features: [], highlighted?}] }
- faq: { title, faqs: [{question, answer}] }
- gallery: { title, images: [{src, alt}] }
- blog: { title, posts: [{title, excerpt, date, image?}] }
- contact: { title, subtitle, email, phone, address }
- cta: { title, subtitle, ctaText, backgroundColor? }
- footer: { companyName, description, links: [{title, items: [{label, href}]}], copyright }

Exemplos de comandos:
- "mude a cor primária para azul" → altere globalStyles.primaryColor
- "adicione mais um feature" → adicione item ao array features
- "remova a seção de testimonials" → remova a seção do array
- "mude o título do hero para X" → altere content.headline da seção hero
- "adicione uma seção de FAQ" → adicione nova seção com type: "faq"

IMPORTANTE: Sempre retorne o LayoutTree COMPLETO com as modificações aplicadas.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { projectId, briefing, messages, currentLayout, editMode } = await req.json();
    console.log("Request for project:", projectId);
    console.log("Edit mode:", editMode);
    console.log("Has current layout:", !!currentLayout);

    // Determine which system prompt to use
    const isEditMode = editMode && currentLayout;
    const systemPrompt = isEditMode ? editSystemPrompt : generateSystemPrompt;

    // Build conversation messages
    const conversationMessages = [
      { role: "system", content: systemPrompt },
    ];

    if (isEditMode) {
      // For edit mode, provide the current layout as context
      conversationMessages.push({
        role: "user",
        content: `Layout atual do site:\n${JSON.stringify(currentLayout, null, 2)}`,
      });
      conversationMessages.push({
        role: "assistant",
        content: "Entendi o layout atual. Qual modificação você gostaria de fazer?",
      });
    } else if (briefing) {
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
        temperature: isEditMode ? 0.3 : 0.7, // Lower temperature for edits
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
    console.log("AI response received, length:", aiResponse?.length);

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
      
      // Try to find JSON object in the response
      if (!layoutTree) {
        const objectMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          try {
            layoutTree = JSON.parse(objectMatch[0]);
          } catch (e) {
            console.error("Failed to parse JSON object:", e);
          }
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

        // Create a version with appropriate message
        const commitMessage = isEditMode 
          ? `Modificação: ${messages?.[messages.length - 1]?.content?.substring(0, 50) || "Edição via chat"}...`
          : "Layout gerado pela IA";
          
        const { error: versionError } = await supabase
          .from("layout_versions")
          .insert({
            project_id: projectId,
            layout_tree: layoutTree,
            commit_message: commitMessage,
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
        message: layoutTree ? (isEditMode ? "Layout modificado com sucesso!" : "Layout gerado com sucesso!") : responseText,
        success: !!layoutTree,
        isEdit: isEditMode,
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
