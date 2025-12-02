import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const baseSystemPrompt = `You are an expert web developer specialized in creating FAST, SEO-OPTIMIZED, and VISUALLY STUNNING websites.

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
1. index.html - Main page with COMPLETE HTML including header and footer INLINE (NO placeholders)
2. css/variables.css - CSS custom properties (colors, fonts, spacing)
3. css/styles.css - Main stylesheet with all component styles
4. css/responsive.css - Media queries for responsive design
5. css/animations.css - CSS animations and transitions
6. js/main.js - Main JavaScript file (menu toggle, smooth scroll, etc.)
7. js/animations.js - Scroll animations with Intersection Observer

## CRITICAL: HEADER AND FOOTER MUST BE INLINE
- DO NOT use placeholders like {{ header }} or <div id="header-placeholder">
- The header and footer HTML MUST be written directly inside index.html
- This ensures the site works immediately without any JavaScript injection

## MANDATORY: PROFESSIONAL ICON LIBRARY (Lucide Icons)
Use Lucide Icons via CDN for ALL icons. Add this in the <head>:
<script src="https://unpkg.com/lucide@latest"></script>

Then use icons like this:
<i data-lucide="phone" class="icon"></i>
<i data-lucide="mail" class="icon"></i>
<i data-lucide="map-pin" class="icon"></i>
<i data-lucide="clock" class="icon"></i>
<i data-lucide="star" class="icon"></i>
<i data-lucide="check" class="icon"></i>
<i data-lucide="menu" class="icon"></i>
<i data-lucide="x" class="icon"></i>
<i data-lucide="chevron-down" class="icon"></i>
<i data-lucide="facebook" class="icon"></i>
<i data-lucide="instagram" class="icon"></i>
<i data-lucide="linkedin" class="icon"></i>

Initialize at end of body: <script>lucide.createIcons();</script>

Style icons consistently:
.icon { width: 24px; height: 24px; stroke-width: 1.5; }
.icon-sm { width: 16px; height: 16px; }
.icon-lg { width: 32px; height: 32px; }

## MANDATORY: RESPONSIVE NAVIGATION MENU
Every site MUST have a sticky header with responsive menu:

HTML Structure:
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

Required CSS:
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}
.navbar.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.nav-menu { display: flex; gap: 2rem; }
.nav-link { color: var(--text); text-decoration: none; font-weight: 500; transition: color 0.3s; }
.nav-link:hover { color: var(--primary); }
.hamburger { display: none; background: none; border: none; cursor: pointer; }
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

Required JavaScript (in main.js):
// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('active'));
  });
}
// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
});
// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

## MANDATORY: GOOGLE FONTS
Always include professional fonts via <link> tags (NEVER @import):

For Healthcare/Clinics:
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
--font-heading: 'Playfair Display', serif;
--font-body: 'Open Sans', sans-serif;

For Services/Desentupidoras:
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
--font-heading: 'Montserrat', sans-serif;
--font-body: 'Roboto', sans-serif;

For Restaurants/Food:
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Nunito:wght@300;400;600&display=swap" rel="stylesheet">
--font-heading: 'Playfair Display', serif;
--font-body: 'Nunito', sans-serif;

For Law/Professional:
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Source+Sans+Pro:wght@300;400;600&display=swap" rel="stylesheet">
--font-heading: 'Cormorant Garamond', serif;
--font-body: 'Source Sans Pro', sans-serif;

## PERFORMANCE REQUIREMENTS (Critical):
- All images MUST have loading="lazy" and explicit width/height attributes
- CSS critical path inline in <head> for above-the-fold content
- All scripts at end of body with defer attribute
- Preconnect to external fonts: <link rel="preconnect" href="https://fonts.googleapis.com">
- Font-display: swap for all web fonts
- Use CSS containment where appropriate
- Avoid render-blocking resources
- No CSS @import, use <link> tags instead

## SEO REQUIREMENTS (Mandatory):
- Unique <title> with brand + keyword (50-60 characters)
- Meta description compelling and keyword-rich (150-160 characters)
- Complete Open Graph tags: og:title, og:description, og:image, og:type, og:url
- Twitter Cards: twitter:card, twitter:title, twitter:description
- Schema.org JSON-LD for LocalBusiness or Service
- Canonical URL on all pages
- Semantic HTML5: header, main, nav, section, article, aside, footer
- Single H1 per page, proper heading hierarchy (H1 > H2 > H3)
- Alt text on ALL images with descriptive keywords
- Internal linking with relevant anchor text

## DESIGN REQUIREMENTS (Modern 2024/2025):
- Gradients sutis and glassmorphism (backdrop-filter: blur)
- Border radius generosos: 12-24px for cards and buttons
- Multi-layer shadows with color tones
- Typography with weight contrast: light titles + bold headings or vice versa
- Generous whitespace: 60-100px padding on sections
- Cards with backdrop-filter blur for depth
- Bento grid layouts for features/services
- Vibrant accent colors on CTAs and interactive elements
- Dark mode as default OR elegant light theme
- Consistent stroke-width on icons

## ANIMATION REQUIREMENTS:
- Fade-in on scroll using Intersection Observer (in js/animations.js)
- Hover effects on cards: transform: translateY(-4px), box-shadow increase
- All transitions: 300ms ease-out
- Staggered animations on lists (animation-delay incremental)
- Micro-interactions on buttons: scale(1.02) on hover
- Smooth scroll for internal navigation: scroll-behavior: smooth

## SECTIONS TO INCLUDE (based on briefing):
- Hero section with headline, subheadline, and prominent CTA
- Features/Services section with icons or cards
- About section with credibility elements
- Testimonials section (carousel or grid)
- Stats/Numbers section (if applicable)
- FAQ section (if applicable)
- Contact section with form or contact info
- Footer with links, social, and legal

## FILE CONTENT EXAMPLES:

### js/animations.js (scroll reveal)
document.addEventListener('DOMContentLoaded', function() {
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

COLOR SCHEME: Use the provided primary and secondary colors from the briefing, or choose a professional, modern palette based on the business type.

Make the design professional, modern, visually stunning with excellent UX, proper spacing, typography hierarchy, and smooth interactions.`;

async function fetchActiveMemories(supabase: any): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("ai_memories")
      .select("title, content, type, category, priority")
      .eq("is_active", true)
      .order("priority", { ascending: false });

    if (error || !data || data.length === 0) return "";

    const memoryContext = data
      .map((m: any) => `[${m.category?.toUpperCase() || m.type.toUpperCase()}] ${m.title}:\n${m.content}`)
      .join("\n\n---\n\n");

    return `\n\n## AI KNOWLEDGE BASE (FOLLOW THESE INSTRUCTIONS STRICTLY):\n\n${memoryContext}`;
  } catch {
    return "";
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
6. Maintain SEO best practices (meta tags, Schema.org, etc.)
7. Maintain performance optimizations (lazy loading, defer, etc.)
8. Maintain animation classes and Intersection Observer functionality
9. Keep Lucide Icons initialization: lucide.createIcons()
10. Keep responsive menu JavaScript functionality`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, briefing, currentFiles, editMode, userMessage } = await req.json();

    console.log("Request for project:", projectId);
    console.log("Edit mode:", editMode);
    console.log("Has current files:", !!currentFiles);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client for fetching memories
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch active AI memories
    const memoryContext = await fetchActiveMemories(supabase);
    console.log("Memory context loaded:", memoryContext ? "yes" : "no");

    // Build system prompt with memories
    const systemPrompt = baseSystemPrompt + memoryContext;

    // Build messages array
    const messages = [];

    if (editMode && currentFiles) {
      messages.push({
        role: "system",
        content: editSystemPrompt + memoryContext,
      });
      messages.push({
        role: "user",
        content: `Current files:\n\n${JSON.stringify(currentFiles, null, 2)}\n\nUser request: ${userMessage}`,
      });
    } else {
      messages.push({
        role: "system",
        content: systemPrompt,
      });
      messages.push({
        role: "user",
        content: `Create a website with the following briefing:\n\n${briefing}`,
      });
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
        messages,
        temperature: 0.7,
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

    console.log("AI response received, length:", content.length);

    // Parse the JSON response
    let filesData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      filesData = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON parse error:", e);
      // Try to find JSON object directly
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

    // Save files to database
    if (projectId) {

      // Delete existing files for this project
      await supabase.from("project_files").delete().eq("project_id", projectId);

      // Insert new files
      const filesToInsert = filesData.files.map((file: any) => ({
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

      // Update project status
      await supabase
        .from("projects")
        .update({ status: "ready", updated_at: new Date().toISOString() })
        .eq("id", projectId);

      console.log("Files saved to database:", filesToInsert.length);
    }

    return new Response(
      JSON.stringify({
        success: true,
        files: filesData.files,
        message: editMode ? "Arquivos atualizados com sucesso!" : "Arquivos gerados com sucesso!",
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
