import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fetch active memories for Design Analyst
async function fetchDesignAnalystMemories() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("ai_memories")
    .select("title, content")
    .or("agent.eq.design_analyst,agent.eq.all")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching memories:", error);
    return [];
  }

  return data || [];
}

const designAnalystPrompt = `You are a DESIGN ANALYST AI specialized in extracting precise design specifications from reference images and business context.

Your job is to analyze the provided reference images (if any) and the business briefing to create a DETAILED DESIGN SPECIFICATION that will guide a code generator.

## OUTPUT FORMAT (STRICT JSON):
{
  "design": {
    "colors": {
      "primary": "#HEX",
      "primaryLight": "#HEX",
      "primaryDark": "#HEX",
      "secondary": "#HEX",
      "accent": "#HEX",
      "background": "#HEX",
      "backgroundAlt": "#HEX",
      "text": "#HEX",
      "textMuted": "#HEX",
      "border": "#HEX",
      "gradientStart": "#HEX",
      "gradientEnd": "#HEX"
    },
    "typography": {
      "headingFont": "Font Name",
      "headingStyle": "serif|sans-serif",
      "headingWeights": [400, 600, 700],
      "bodyFont": "Font Name",
      "bodyStyle": "serif|sans-serif",
      "bodyWeights": [300, 400, 500, 600],
      "googleFontsUrl": "https://fonts.googleapis.com/css2?family=..."
    },
    "layout": {
      "style": "modern|classic|minimalist|bold|elegant",
      "maxWidth": "1200px",
      "sectionPadding": "80px",
      "elementSpacing": "24px",
      "borderRadius": {
        "small": "8px",
        "medium": "16px",
        "large": "24px",
        "pill": "9999px"
      },
      "shadows": {
        "style": "subtle|dramatic|colored|none",
        "card": "0 4px 20px rgba(0,0,0,0.08)",
        "button": "0 4px 14px rgba(0,0,0,0.1)"
      }
    },
    "components": {
      "navbar": {
        "style": "sticky|fixed|static",
        "background": "solid|transparent|glass",
        "height": "80px"
      },
      "buttons": {
        "style": "rounded|pill|sharp",
        "hasGradient": true,
        "hasShadow": true
      },
      "cards": {
        "style": "glass|solid|bordered|elevated",
        "hasHoverEffect": true
      },
      "hero": {
        "layout": "centered|left-aligned|split",
        "hasOverlay": true,
        "hasDecorative": true
      }
    },
    "effects": {
      "useGlassmorphism": true,
      "useGradients": true,
      "useAnimations": true,
      "decorativeElements": ["blobs", "patterns", "shapes"]
    }
  },
  "businessContext": {
    "type": "healthcare|service|restaurant|professional|ecommerce|corporate",
    "tone": "professional|friendly|luxurious|energetic|calm",
    "targetAudience": "description of target audience"
  },
  "recommendations": [
    "Specific design recommendation 1",
    "Specific design recommendation 2"
  ]
}

## ANALYSIS RULES:

### If reference images are provided:
1. Extract EXACT colors from the dominant elements (headers, buttons, backgrounds)
2. Identify the typography style (serif elegance vs sans-serif modern)
3. Note the border-radius pattern (sharp, rounded, or pill)
4. Identify shadow styles and glassmorphism usage
5. Map the layout structure and spacing rhythm

### If NO reference images:
Use these industry-specific palettes:

**Healthcare/Clinics:**
- Primary: #2D5F88 (trust blue) or #0D9488 (medical teal)
- Secondary: #F0FDFA (soft mint)
- Fonts: Playfair Display + Open Sans
- Style: Calm, professional, trustworthy

**Services/Desentupidoras:**
- Primary: #1E40AF (strong blue) or #0891B2 (cyan)
- Secondary: #FCD34D (attention yellow)
- Fonts: Montserrat + Roboto
- Style: Bold, reliable, urgent

**Restaurants/Food:**
- Primary: #DC2626 (appetizing red) or #EA580C (warm orange)
- Secondary: #FEF3C7 (cream)
- Fonts: Playfair Display + Nunito
- Style: Warm, inviting, appetizing

**Law/Professional:**
- Primary: #1E3A5F (navy) or #78350F (rich brown)
- Secondary: #D4AF37 (gold accent)
- Fonts: Cormorant Garamond + Source Sans Pro
- Style: Elegant, authoritative, sophisticated

**Tech/Modern:**
- Primary: #6366F1 (indigo) or #8B5CF6 (purple)
- Secondary: #10B981 (emerald accent)
- Fonts: Inter + DM Sans
- Style: Clean, innovative, cutting-edge

IMPORTANT: Return ONLY the JSON object, no markdown, no explanation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { briefing, referenceImages } = await req.json();

    console.log("Design Analyst: Analyzing briefing...");
    console.log("Has reference images:", !!referenceImages?.length);

    // Fetch agent-specific memories
    const memories = await fetchDesignAnalystMemories();
    console.log(`Loaded ${memories.length} memories for Design Analyst`);
    
    const memoryContext = memories.length > 0
      ? "\n\n## ADDITIONAL INSTRUCTIONS FROM KNOWLEDGE BASE:\n" +
        memories.map((m) => `### ${m.title}\n${m.content}`).join("\n\n")
      : "";

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Build system prompt with memories
    const fullSystemPrompt = designAnalystPrompt + memoryContext;

    // Build messages with vision support if images provided
    const messages: any[] = [
      {
        role: "system",
        content: fullSystemPrompt,
      },
    ];

    // Build user message content
    const userContent: any[] = [
      {
        type: "text",
        text: `Analyze this business briefing and create a detailed design specification:\n\n${briefing}`,
      },
    ];

    // Add reference images if provided
    if (referenceImages && referenceImages.length > 0) {
      console.log("Adding reference images to analysis:", referenceImages.length);
      for (const imageUrl of referenceImages) {
        userContent.push({
          type: "image_url",
          image_url: { url: imageUrl },
        });
      }
      userContent[0].text += "\n\nReference images are provided above. Extract the EXACT design specifications from these images.";
    }

    messages.push({
      role: "user",
      content: userContent,
    });

    console.log("Calling OpenAI GPT-4o for design analysis...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("OpenAI billing issue. Please check your account.");
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Design analysis received, parsing...");

    // Parse the JSON response
    let designSpecs;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      designSpecs = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parse error:", e);
      // Try to find JSON object directly
      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = content.substring(jsonStart, jsonEnd + 1);
        designSpecs = JSON.parse(jsonStr);
      } else {
        throw new Error("Could not parse design specs as JSON");
      }
    }

    console.log("Design specs extracted successfully");
    console.log("Primary color:", designSpecs.design?.colors?.primary);
    console.log("Heading font:", designSpecs.design?.typography?.headingFont);

    return new Response(
      JSON.stringify({
        success: true,
        designSpecs,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-design:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        // Return fallback design specs so the pipeline doesn't break
        designSpecs: {
          design: {
            colors: {
              primary: "#2D5F88",
              primaryLight: "#4A90D9",
              primaryDark: "#1E3A5F",
              secondary: "#F0FDFA",
              accent: "#0D9488",
              background: "#FFFFFF",
              backgroundAlt: "#F8FAFC",
              text: "#1F2937",
              textMuted: "#6B7280",
              border: "#E5E7EB",
              gradientStart: "#2D5F88",
              gradientEnd: "#0D9488",
            },
            typography: {
              headingFont: "Playfair Display",
              headingStyle: "serif",
              headingWeights: [400, 600, 700],
              bodyFont: "Open Sans",
              bodyStyle: "sans-serif",
              bodyWeights: [300, 400, 500, 600],
              googleFontsUrl:
                "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@300;400;500;600&display=swap",
            },
            layout: {
              style: "modern",
              maxWidth: "1200px",
              sectionPadding: "80px",
              elementSpacing: "24px",
              borderRadius: { small: "8px", medium: "16px", large: "24px", pill: "9999px" },
              shadows: {
                style: "subtle",
                card: "0 4px 20px rgba(0,0,0,0.08)",
                button: "0 4px 14px rgba(0,0,0,0.1)",
              },
            },
            components: {
              navbar: { style: "sticky", background: "glass", height: "80px" },
              buttons: { style: "rounded", hasGradient: true, hasShadow: true },
              cards: { style: "glass", hasHoverEffect: true },
              hero: { layout: "centered", hasOverlay: true, hasDecorative: true },
            },
            effects: {
              useGlassmorphism: true,
              useGradients: true,
              useAnimations: true,
              decorativeElements: ["blobs"],
            },
          },
          businessContext: {
            type: "healthcare",
            tone: "professional",
            targetAudience: "general",
          },
          recommendations: ["Use calming colors", "Professional typography"],
        },
      }),
      {
        status: 200, // Return 200 even on error to allow fallback
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
