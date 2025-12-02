import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Code Generator prompt - receives design specs from Design Analyst
function buildCodeGeneratorPrompt(designSpecs: any) {
  const colors = designSpecs?.design?.colors || {};
  const typography = designSpecs?.design?.typography || {};
  const layout = designSpecs?.design?.layout || {};
  const components = designSpecs?.design?.components || {};
  const effects = designSpecs?.design?.effects || {};

  return `You are an expert CODE GENERATOR specialized in creating production-ready websites.

## CRITICAL: USE THESE EXACT DESIGN SPECIFICATIONS (from Design Analyst)

### COLORS (USE EXACTLY AS PROVIDED):
--primary: ${colors.primary || "#2D5F88"};
--primary-light: ${colors.primaryLight || "#4A90D9"};
--primary-dark: ${colors.primaryDark || "#1E3A5F"};
--secondary: ${colors.secondary || "#F0FDFA"};
--accent: ${colors.accent || "#0D9488"};
--background: ${colors.background || "#FFFFFF"};
--background-alt: ${colors.backgroundAlt || "#F8FAFC"};
--text: ${colors.text || "#1F2937"};
--text-muted: ${colors.textMuted || "#6B7280"};
--border: ${colors.border || "#E5E7EB"};
--gradient-start: ${colors.gradientStart || colors.primary || "#2D5F88"};
--gradient-end: ${colors.gradientEnd || colors.accent || "#0D9488"};

### TYPOGRAPHY (USE EXACTLY):
Google Fonts URL: ${typography.googleFontsUrl || "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@300;400;500;600&display=swap"}
--font-heading: '${typography.headingFont || "Playfair Display"}', ${typography.headingStyle || "serif"};
--font-body: '${typography.bodyFont || "Open Sans"}', ${typography.bodyStyle || "sans-serif"};

### LAYOUT SPECS:
Max Width: ${layout.maxWidth || "1200px"}
Section Padding: ${layout.sectionPadding || "80px"}
Border Radius Small: ${layout.borderRadius?.small || "8px"}
Border Radius Medium: ${layout.borderRadius?.medium || "16px"}
Border Radius Large: ${layout.borderRadius?.large || "24px"}
Card Shadow: ${layout.shadows?.card || "0 4px 20px rgba(0,0,0,0.08)"}

### COMPONENT STYLES:
Navbar: ${components.navbar?.style || "sticky"}, ${components.navbar?.background || "glass"}
Buttons: ${components.buttons?.style || "rounded"}, gradient: ${components.buttons?.hasGradient}, shadow: ${components.buttons?.hasShadow}
Cards: ${components.cards?.style || "glass"}, hover: ${components.cards?.hasHoverEffect}
Hero: ${components.hero?.layout || "centered"}, overlay: ${components.hero?.hasOverlay}

### EFFECTS TO USE:
Glassmorphism: ${effects.useGlassmorphism}
Gradients: ${effects.useGradients}
Animations: ${effects.useAnimations}

IMPORTANT: Return ONLY a valid JSON object with the following structure:
{
  "files": [
    {
      "path": "index.html",
      "name": "index.html",
      "type": "html",
      "content": "<!DOCTYPE html>..."
    }
  ]
}

## REQUIRED FILES TO GENERATE:
1. index.html - Main page with COMPLETE HTML including header and footer INLINE
2. css/variables.css - CSS custom properties using the EXACT colors above
3. css/styles.css - Main stylesheet importing variables.css correctly
4. css/responsive.css - Media queries for responsive design
5. css/animations.css - CSS animations and transitions
6. js/main.js - Main JavaScript file (menu toggle, smooth scroll, etc.)
7. js/animations.js - Scroll animations with Intersection Observer

## CRITICAL CSS RULES:

### variables.css MUST start with:
:root {
  /* Colors - FROM DESIGN ANALYST */
  --primary: ${colors.primary || "#2D5F88"};
  --primary-light: ${colors.primaryLight || "#4A90D9"};
  --primary-dark: ${colors.primaryDark || "#1E3A5F"};
  --secondary: ${colors.secondary || "#F0FDFA"};
  --accent: ${colors.accent || "#0D9488"};
  --background: ${colors.background || "#FFFFFF"};
  --background-alt: ${colors.backgroundAlt || "#F8FAFC"};
  --text: ${colors.text || "#1F2937"};
  --text-muted: ${colors.textMuted || "#6B7280"};
  --border: ${colors.border || "#E5E7EB"};
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, ${colors.gradientStart || colors.primary || "#2D5F88"}, ${colors.gradientEnd || colors.accent || "#0D9488"});
  
  /* Typography */
  --font-heading: '${typography.headingFont || "Playfair Display"}', ${typography.headingStyle || "serif"};
  --font-body: '${typography.bodyFont || "Open Sans"}', ${typography.bodyStyle || "sans-serif"};
  
  /* Layout */
  --max-width: ${layout.maxWidth || "1200px"};
  --section-padding: ${layout.sectionPadding || "80px"};
  --radius-sm: ${layout.borderRadius?.small || "8px"};
  --radius-md: ${layout.borderRadius?.medium || "16px"};
  --radius-lg: ${layout.borderRadius?.large || "24px"};
  
  /* Shadows */
  --shadow-card: ${layout.shadows?.card || "0 4px 20px rgba(0,0,0,0.08)"};
  --shadow-button: ${layout.shadows?.button || "0 4px 14px rgba(0,0,0,0.1)"};
}

### styles.css MUST NOT use @import for variables. Instead use <link> tags in HTML:
<link rel="stylesheet" href="css/variables.css">
<link rel="stylesheet" href="css/animations.css">
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="css/responsive.css">

## MANDATORY: PROFESSIONAL NAVBAR (WORKING CODE)
<header class="navbar">
  <a href="#" class="logo">Logo</a>
  <nav class="nav-menu" id="nav-menu">
    <a href="#home" class="nav-link">Home</a>
    <a href="#services" class="nav-link">Serviços</a>
    <a href="#about" class="nav-link">Sobre</a>
    <a href="#contact" class="nav-link">Contato</a>
  </nav>
  <button class="hamburger" id="hamburger" aria-label="Menu">
    <i data-lucide="menu" class="icon hamburger-open"></i>
    <i data-lucide="x" class="icon hamburger-close"></i>
  </button>
</header>

Required navbar CSS in styles.css:
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background: ${components.navbar?.background === "glass" ? "rgba(255,255,255,0.95)" : "var(--background)"};
  ${components.navbar?.background === "glass" ? "backdrop-filter: blur(10px);" : ""}
  position: ${components.navbar?.style || "sticky"};
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}
.navbar.scrolled { box-shadow: var(--shadow-card); }
.logo { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: var(--primary); text-decoration: none; }
.nav-menu { display: flex; gap: 2rem; list-style: none; margin: 0; padding: 0; }
.nav-link { color: var(--text); text-decoration: none; font-weight: 500; font-family: var(--font-body); transition: color 0.3s; position: relative; }
.nav-link:hover { color: var(--primary); }
.nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: var(--gradient-primary); transition: width 0.3s; }
.nav-link:hover::after { width: 100%; }
.hamburger { display: none; background: none; border: none; cursor: pointer; padding: 0.5rem; }
.hamburger-close { display: none; }

@media (max-width: 768px) {
  .hamburger { display: flex; }
  .nav-menu {
    position: fixed;
    top: 0; right: -100%;
    width: 80%; max-width: 300px;
    height: 100vh;
    flex-direction: column;
    background: var(--background);
    padding: 5rem 2rem;
    transition: right 0.3s ease;
    box-shadow: -4px 0 20px rgba(0,0,0,0.1);
  }
  .nav-menu.active { right: 0; }
  .nav-menu.active ~ .hamburger .hamburger-open { display: none; }
  .nav-menu.active ~ .hamburger .hamburger-close { display: block; }
}

## MANDATORY: LUCIDE ICONS
Add in <head>: <script src="https://unpkg.com/lucide@latest"></script>
Initialize at end of body: <script>lucide.createIcons();</script>

## MANDATORY: GOOGLE FONTS (via <link>, NEVER @import)
Add in <head>:
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${typography.googleFontsUrl || "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@300;400;500;600&display=swap"}" rel="stylesheet">

## CARD STYLES (based on design specs)
.card {
  background: ${components.cards?.style === "glass" ? "rgba(255,255,255,0.8)" : "var(--background)"};
  ${components.cards?.style === "glass" ? "backdrop-filter: blur(10px);" : ""}
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}
${components.cards?.hasHoverEffect ? ".card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }" : ""}

## BUTTON STYLES
.btn-primary {
  ${components.buttons?.hasGradient ? "background: var(--gradient-primary);" : "background: var(--primary);"}
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: ${components.buttons?.style === "pill" ? "9999px" : components.buttons?.style === "sharp" ? "4px" : "var(--radius-md)"};
  font-family: var(--font-body);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  ${components.buttons?.hasShadow ? "box-shadow: var(--shadow-button);" : ""}
}
.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  ${components.buttons?.hasShadow ? "box-shadow: 0 8px 25px rgba(0,0,0,0.15);" : ""}
}

## HERO SECTION
.hero {
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: ${components.hero?.layout === "centered" ? "center" : "flex-start"};
  text-align: ${components.hero?.layout === "centered" ? "center" : "left"};
  padding: var(--section-padding) 5%;
  position: relative;
  background: var(--background-alt);
}
${components.hero?.hasOverlay ? ".hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.03) 0%, transparent 50%); pointer-events: none; }" : ""}

## SECTIONS
section {
  padding: var(--section-padding) 5%;
}
.section-title {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--text);
  margin-bottom: 1rem;
}
.section-subtitle {
  font-family: var(--font-body);
  color: var(--text-muted);
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto 3rem;
}

## PERFORMANCE REQUIREMENTS:
- All images MUST have loading="lazy" and width/height
- Scripts at end of body with defer
- Font-display: swap

## SEO REQUIREMENTS:
- Unique <title> (50-60 chars)
- Meta description (150-160 chars)
- Open Graph tags
- Schema.org JSON-LD
- Semantic HTML5

Make the design EXACTLY match the provided design specifications. Do not deviate from the colors, fonts, or layout styles specified above.`;
}

async function fetchActiveMemories(supabase: any): Promise<string> {
  try {
    // Fetch memories specifically for code_generator agent or shared (all)
    const { data, error } = await supabase
      .from("ai_memories")
      .select("title, content, type, category, priority, agent")
      .eq("is_active", true)
      .or("agent.eq.code_generator,agent.eq.all")
      .order("priority", { ascending: false });

    if (error || !data || data.length === 0) {
      console.log("No memories found for Code Generator agent");
      return "";
    }

    console.log(`Loaded ${data.length} memories for Code Generator agent`);

    const memoryContext = data
      .map((m: any) => `[${m.category?.toUpperCase() || m.type.toUpperCase()}] ${m.title}:\n${m.content}`)
      .join("\n\n---\n\n");

    return `\n\n## AI KNOWLEDGE BASE (CODE GENERATOR):\n\n${memoryContext}`;
  } catch (e) {
    console.error("Error fetching memories:", e);
    return "";
  }
}

async function analyzeDesign(briefing: string, referenceImages?: string[]): Promise<any> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  
  console.log("Calling Design Analyst agent...");
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/analyze-design`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({ briefing, referenceImages }),
    });

    if (!response.ok) {
      console.error("Design Analyst error:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("Design Analyst response:", data.success);
    return data.designSpecs;
  } catch (error) {
    console.error("Error calling Design Analyst:", error);
    return null;
  }
}

async function optimizeSEO(files: any[], businessInfo?: any): Promise<any[]> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  
  console.log("Calling SEO Specialist agent...");
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/optimize-seo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({ files, businessInfo }),
    });

    if (!response.ok) {
      console.error("SEO Specialist error:", response.status);
      return files; // Return original files if SEO fails
    }

    const data = await response.json();
    console.log("SEO Specialist response:", data.success);
    return data.files || files;
  } catch (error) {
    console.error("Error calling SEO Specialist:", error);
    return files; // Return original files if SEO fails
  }
}

const editSystemPrompt = `You are an expert web developer. Modify the existing website files based on user instructions.

IMPORTANT: Return ONLY a valid JSON object with ALL files (modified and unmodified):
{
  "files": [
    {
      "path": "index.html",
      "name": "index.html", 
      "type": "html",
      "content": "<!DOCTYPE html>..."
    }
  ]
}

RULES:
1. Only modify what the user specifically requests
2. Preserve all existing functionality, styling, SEO, and animations
3. Return ALL files, even unmodified ones
4. Maintain consistency across all files
5. Keep the same file structure
6. Maintain SEO best practices
7. Maintain performance optimizations
8. Keep Lucide Icons initialization
9. Keep responsive menu JavaScript functionality
10. PRESERVE the existing color scheme and fonts unless user asks to change`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, briefing, currentFiles, editMode, userMessage, referenceImages } = await req.json();

    console.log("=== MULTI-AGENT PIPELINE START ===");
    console.log("Project:", projectId);
    console.log("Edit mode:", editMode);
    console.log("Has reference images:", !!referenceImages?.length);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active AI memories
    const memoryContext = await fetchActiveMemories(supabase);
    console.log("Memory context loaded:", memoryContext ? "yes" : "no");

    let systemPrompt: string;
    const messages: any[] = [];

    if (editMode && currentFiles) {
      // EDIT MODE: Use simple edit prompt
      console.log("=== EDIT MODE ===");
      messages.push({
        role: "system",
        content: editSystemPrompt + memoryContext,
      });
      messages.push({
        role: "user",
        content: `Current files:\n\n${JSON.stringify(currentFiles, null, 2)}\n\nUser request: ${userMessage}`,
      });
    } else {
      // GENERATION MODE: Use multi-agent pipeline
      console.log("=== GENERATION MODE - MULTI-AGENT PIPELINE ===");
      
      // Step 1: Call Design Analyst Agent
      console.log("Step 1: Calling Design Analyst...");
      const designSpecs = await analyzeDesign(briefing || userMessage, referenceImages);
      
      if (designSpecs) {
        console.log("Design specs received:");
        console.log("- Primary color:", designSpecs.design?.colors?.primary);
        console.log("- Heading font:", designSpecs.design?.typography?.headingFont);
        console.log("- Layout style:", designSpecs.design?.layout?.style);
      } else {
        console.log("Using fallback design specs");
      }

      // Step 2: Build Code Generator prompt with design specs
      console.log("Step 2: Building Code Generator prompt...");
      systemPrompt = buildCodeGeneratorPrompt(designSpecs) + memoryContext;

      messages.push({
        role: "system",
        content: systemPrompt,
      });
      messages.push({
        role: "user",
        content: `Create a complete website with the following briefing:\n\n${briefing || userMessage}\n\nIMPORTANT: Use the EXACT colors and fonts specified in the system prompt. These came from the Design Analyst agent who analyzed the reference images and business context.`,
      });
    }

    console.log("Step 3: Calling Code Generator (Lovable AI)...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.5, // Lower for more consistent code output
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Code Generator response received, length:", content.length);

    // Parse the JSON response
    let filesData;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      filesData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parse error:", e);
      const jsonStart = content.indexOf("{");
      const jsonEnd = content.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = content.substring(jsonStart, jsonEnd + 1);
        filesData = JSON.parse(jsonStr);
      } else {
        throw new Error("Could not parse AI response as JSON");
      }
    }

    if (!filesData.files || !Array.isArray(filesData.files)) {
      throw new Error("Invalid response structure - missing files array");
    }

    let finalFiles = filesData.files;

    // Step 4: Call SEO Specialist (only for generation mode)
    if (!editMode) {
      console.log("Step 4: Calling SEO Specialist...");
      const optimizedFiles = await optimizeSEO(finalFiles, { briefing: briefing || userMessage });
      if (optimizedFiles && optimizedFiles.length > 0) {
        finalFiles = optimizedFiles;
        console.log("SEO optimizations applied");
      }
    }

    // Save files to database
    if (projectId) {
      await supabase.from("project_files").delete().eq("project_id", projectId);

      const filesToInsert = finalFiles.map((file: any) => ({
        project_id: projectId,
        file_path: file.path,
        file_name: file.name,
        file_type: file.type,
        content: file.content,
      }));

      const { error: insertError } = await supabase
        .from("project_files")
        .insert(filesToInsert);

      if (insertError) {
        console.error("Database insert error:", insertError);
        throw insertError;
      }

      await supabase
        .from("projects")
        .update({ status: "ready", updated_at: new Date().toISOString() })
        .eq("id", projectId);

      console.log("=== PIPELINE COMPLETE ===");
      console.log("Files saved:", filesToInsert.length);
    }

    return new Response(
      JSON.stringify({
        success: true,
        files: finalFiles,
        message: editMode ? "Arquivos atualizados com sucesso!" : "Site gerado com pipeline de 3 agentes!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-files:", error);
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
