import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

## CRITICAL: GENERATE A SINGLE index.html FILE WITH ALL CSS AND JS INLINE

You MUST return ONLY ONE file: index.html with:
- ALL CSS inside <style> tags in the <head>
- ALL JavaScript inside <script> tags before </body>
- Complete, professional, beautiful design

## EXACT DESIGN SPECIFICATIONS (from Design Analyst):

### COLORS:
Primary: ${colors.primary || "#2D5F88"}
Primary Light: ${colors.primaryLight || "#4A90D9"}
Primary Dark: ${colors.primaryDark || "#1E3A5F"}
Secondary: ${colors.secondary || "#F0FDFA"}
Accent: ${colors.accent || "#0D9488"}
Background: ${colors.background || "#FFFFFF"}
Background Alt: ${colors.backgroundAlt || "#F8FAFC"}
Text: ${colors.text || "#1F2937"}
Text Muted: ${colors.textMuted || "#6B7280"}
Border: ${colors.border || "#E5E7EB"}
Gradient: from ${colors.gradientStart || colors.primary || "#2D5F88"} to ${colors.gradientEnd || colors.accent || "#0D9488"}

### TYPOGRAPHY:
Google Fonts URL: ${typography.googleFontsUrl || "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@300;400;500;600&display=swap"}
Heading Font: '${typography.headingFont || "Playfair Display"}', ${typography.headingStyle || "serif"}
Body Font: '${typography.bodyFont || "Open Sans"}', ${typography.bodyStyle || "sans-serif"}

### LAYOUT:
Max Width: ${layout.maxWidth || "1200px"}
Section Padding: ${layout.sectionPadding || "80px"}
Border Radius: ${layout.borderRadius?.medium || "16px"}

### COMPONENT STYLES:
Navbar: ${components.navbar?.style || "sticky"}, ${components.navbar?.background || "glass"}
Buttons: gradient=${components.buttons?.hasGradient}, shadow=${components.buttons?.hasShadow}
Cards: ${components.cards?.style || "glass"}, hover=${components.cards?.hasHoverEffect}

### EFFECTS:
Glassmorphism: ${effects.useGlassmorphism}
Gradients: ${effects.useGradients}
Animations: ${effects.useAnimations}

## JSON OUTPUT FORMAT (ONLY THIS):
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

## REQUIRED HTML STRUCTURE:

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Title</title>
  <meta name="description" content="...">
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="GOOGLE_FONTS_URL" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  
  <style>
    /* ALL CSS HERE - CSS Variables, Reset, Components, Animations, Responsive */
    :root {
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
      --gradient-primary: linear-gradient(135deg, ${colors.gradientStart || colors.primary}, ${colors.gradientEnd || colors.accent});
      --font-heading: '${typography.headingFont || "Playfair Display"}', ${typography.headingStyle || "serif"};
      --font-body: '${typography.bodyFont || "Open Sans"}', ${typography.bodyStyle || "sans-serif"};
      --max-width: ${layout.maxWidth || "1200px"};
      --section-padding: ${layout.sectionPadding || "80px"};
      --radius: ${layout.borderRadius?.medium || "16px"};
      --shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { font-family: var(--font-body); color: var(--text); background: var(--background); line-height: 1.6; }
    
    /* Include all component styles, animations, and responsive design inline */
  </style>
</head>
<body>
  <!-- HEADER with responsive navbar -->
  <header class="navbar">...</header>
  
  <!-- HERO Section -->
  <section class="hero">...</section>
  
  <!-- About/Services/Features sections -->
  
  <!-- Contact section -->
  
  <!-- FOOTER -->
  <footer>...</footer>
  
  <script>
    // ALL JavaScript inline
    // Lucide icons init
    lucide.createIcons();
    
    // Mobile menu toggle
    // Scroll animations
    // Navbar scroll effects
    // Smooth scroll
  </script>
</body>
</html>

## MANDATORY FEATURES TO INCLUDE:

### 1. PROFESSIONAL NAVBAR (with mobile hamburger menu)
- Sticky/fixed position with glass effect
- Logo + navigation links + hamburger button
- Mobile sidebar menu that slides in
- Scroll effect (shadow on scroll)

### 2. HERO SECTION
- Full viewport height (min-height: 90vh)
- Gradient or image background
- Main headline with gradient text effect
- Subtitle and CTA button with hover animation
- Floating shapes or decorative elements

### 3. SERVICES/FEATURES SECTION
- Grid of cards with hover effects
- Icons using Lucide (data-lucide attribute)
- Glassmorphism card style if enabled

### 4. ABOUT SECTION
- Company/business description
- Stats or highlights with animated counters

### 5. TESTIMONIALS (if relevant)
- Customer quotes with avatars
- Carousel or grid layout

### 6. CONTACT SECTION
- Contact form with styled inputs
- Contact info (phone, email, address)
- Social links

### 7. FOOTER
- Logo and tagline
- Navigation links
- Social icons
- Copyright

### 8. ANIMATIONS (in <style>):
@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
@keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

### 9. JAVASCRIPT (in <script>):
- lucide.createIcons()
- Mobile menu toggle
- Intersection Observer for scroll reveal animations
- Navbar scroll effect
- Smooth anchor scrolling

## CRITICAL RULES:
1. Generate ONLY ONE FILE: index.html
2. ALL CSS must be inside <style> in <head>
3. ALL JavaScript must be inside <script> before </body>
4. Use the EXACT colors from design specs
5. Make it beautiful, modern, and professional
6. Include responsive design (mobile-first)
7. Add smooth animations and hover effects
8. Use Lucide icons via data-lucide attribute
9. Include SEO meta tags
10. Ensure the design is complete and production-ready

Make it BEAUTIFUL with gradients, animations, glassmorphism effects, and modern design patterns!`;
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

// Fetch custom system prompt from ai_agents table
async function fetchCustomAgentPrompt(supabase: any, agentSlug: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("ai_agents")
      .select("system_prompt")
      .eq("slug", agentSlug)
      .eq("is_active", true)
      .single();

    if (error || !data?.system_prompt) {
      return "";
    }

    console.log(`Custom system prompt found for ${agentSlug}`);
    return `\n\n## CUSTOM AGENT INSTRUCTIONS:\n${data.system_prompt}`;
  } catch (e) {
    return "";
  }
}

async function fetchProjectSettings(supabase: any, projectId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("project_settings")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (error || !data) {
      console.log("No project settings found");
      return null;
    }

    console.log("Project settings loaded:", data.company_name);
    return data;
  } catch (e) {
    console.error("Error fetching project settings:", e);
    return null;
  }
}

function buildBusinessDataPrompt(settings: any): string {
  if (!settings) return "";

  const parts: string[] = [];
  
  if (settings.company_name) parts.push(`Nome da Empresa: ${settings.company_name}`);
  if (settings.slogan) parts.push(`Slogan: ${settings.slogan}`);
  if (settings.logo_url) parts.push(`Logo URL: ${settings.logo_url}`);
  if (settings.favicon_url) parts.push(`Favicon URL: ${settings.favicon_url}`);
  
  if (settings.address || settings.city || settings.state) {
    const addressParts = [settings.address, settings.city, settings.state].filter(Boolean);
    parts.push(`Endereço: ${addressParts.join(", ")}`);
  }
  if (settings.zip_code) parts.push(`CEP: ${settings.zip_code}`);
  if (settings.phone) parts.push(`Telefone: ${settings.phone}`);
  if (settings.whatsapp) parts.push(`WhatsApp: ${settings.whatsapp}`);
  if (settings.email) parts.push(`Email: ${settings.email}`);

  // Social links
  const social = settings.social_links || {};
  if (social.instagram) parts.push(`Instagram: ${social.instagram}`);
  if (social.facebook) parts.push(`Facebook: ${social.facebook}`);
  if (social.linkedin) parts.push(`LinkedIn: ${social.linkedin}`);
  if (social.youtube) parts.push(`YouTube: ${social.youtube}`);
  if (social.tiktok) parts.push(`TikTok: ${social.tiktok}`);
  if (social.twitter) parts.push(`Twitter: ${social.twitter}`);

  // Business hours
  const hours = settings.business_hours || {};
  const daysMap: Record<string, string> = {
    monday: "Segunda", tuesday: "Terça", wednesday: "Quarta",
    thursday: "Quinta", friday: "Sexta", saturday: "Sábado", sunday: "Domingo"
  };
  const hoursParts = Object.entries(hours)
    .filter(([_, v]) => v && v !== "Fechado")
    .map(([day, time]) => `${daysMap[day] || day}: ${time}`);
  if (hoursParts.length > 0) {
    parts.push(`Horário de Funcionamento: ${hoursParts.join(" | ")}`);
  }

  // Custom fields
  const custom = settings.custom_fields || {};
  Object.entries(custom).forEach(([key, value]) => {
    if (value) parts.push(`${key}: ${value}`);
  });

  // Gallery images
  if (settings.gallery_images?.length > 0) {
    parts.push(`Galeria de Imagens: ${settings.gallery_images.join(", ")}`);
  }

  if (parts.length === 0) return "";

  return `\n\n## BUSINESS DATA (USE THESE IN THE GENERATED WEBSITE):\n${parts.join("\n")}`;
}

async function analyzeDesign(briefing: string, referenceImages?: string[]): Promise<any> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  console.log("Calling Design Analyst agent...");
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/analyze-design`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
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

async function optimizeSEO(files: any[], businessInfo?: any): Promise<{ files: any[]; applied: boolean }> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  
  console.log("Calling SEO Specialist agent...");
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/optimize-seo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ files, businessInfo }),
    });

    if (!response.ok) {
      console.error("SEO Specialist error:", response.status);
      return { files, applied: false };
    }

    const data = await response.json();
    console.log("SEO Specialist response:", data.success);
    return { files: data.files || files, applied: data.success === true };
  } catch (error) {
    console.error("Error calling SEO Specialist:", error);
    return { files, applied: false };
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

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active AI memories
    const memoryContext = await fetchActiveMemories(supabase);
    console.log("Memory context loaded:", memoryContext ? "yes" : "no");

    // Fetch project settings for business data
    const projectSettings = projectId ? await fetchProjectSettings(supabase, projectId) : null;
    const businessDataPrompt = buildBusinessDataPrompt(projectSettings);
    console.log("Business data loaded:", businessDataPrompt ? "yes" : "no");

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
      systemPrompt = buildCodeGeneratorPrompt(designSpecs) + memoryContext + businessDataPrompt;

      messages.push({
        role: "system",
        content: systemPrompt,
      });
      
      let userPrompt = `Create a complete website with the following briefing:\n\n${briefing || userMessage}\n\nIMPORTANT: Use the EXACT colors and fonts specified in the system prompt. These came from the Design Analyst agent who analyzed the reference images and business context.`;
      
      if (businessDataPrompt) {
        userPrompt += `\n\nIMPORTANT: Use the BUSINESS DATA provided in the system prompt. Include the company name, logo, contact information, social links, and business hours in the appropriate sections of the website.`;
      }
      
      messages.push({
        role: "user",
        content: userPrompt,
      });
    }

    console.log("Step 3: Calling Code Generator (OpenAI GPT-4o)...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.5,
        max_tokens: 16384,
        response_format: { type: "json_object" },
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
    const choice = data.choices?.[0];
    const content = choice?.message?.content;
    const finishReason = choice?.finish_reason;

    console.log("Finish reason:", finishReason);
    console.log("Content length:", content?.length);

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Check for truncation
    if (finishReason === "length") {
      console.error("WARNING: Response was truncated due to token limit!");
    }

    console.log("Code Generator response received, length:", content.length);

    // Parse JSON (response_format guarantees valid JSON)
    let filesData;
    try {
      filesData = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", e);
      console.error("Raw content preview:", content.substring(0, 1000));
      throw new Error(`Could not parse AI response as JSON. finish_reason: ${finishReason}`);
    }

    if (!filesData.files || !Array.isArray(filesData.files)) {
      throw new Error("Invalid response structure - missing files array");
    }

    let finalFiles = filesData.files;
    let seoApplied = false;

    // Step 4: Call SEO Specialist (only for generation mode)
    if (!editMode) {
      console.log("Step 4: Calling SEO Specialist...");
      const seoResult = await optimizeSEO(finalFiles, { briefing: briefing || userMessage });
      if (seoResult.files && seoResult.files.length > 0) {
        finalFiles = seoResult.files;
        seoApplied = seoResult.applied;
        console.log("SEO optimizations applied:", seoApplied);
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
        seoApplied: editMode ? undefined : seoApplied,
        message: editMode ? "Arquivos atualizados com sucesso!" : "Site gerado com pipeline de 3 agentes (OpenAI)!",
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
