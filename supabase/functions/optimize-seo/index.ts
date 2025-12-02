import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchSEOMemories(supabase: any): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("ai_memories")
      .select("title, content, type, category, priority, agent")
      .eq("is_active", true)
      .or("agent.eq.seo_specialist,agent.eq.all")
      .order("priority", { ascending: false });

    if (error || !data || data.length === 0) {
      console.log("No memories found for SEO Specialist agent");
      return "";
    }

    console.log(`Loaded ${data.length} memories for SEO Specialist agent`);

    const memoryContext = data
      .map((m: any) => `[${m.category?.toUpperCase() || m.type.toUpperCase()}] ${m.title}:\n${m.content}`)
      .join("\n\n---\n\n");

    return `\n\n## AI KNOWLEDGE BASE (SEO SPECIALIST):\n\n${memoryContext}`;
  } catch (e) {
    console.error("Error fetching SEO memories:", e);
    return "";
  }
}

const seoSystemPrompt = `You are an expert SEO SPECIALIST agent. Your ONLY job is to review and optimize website files for perfect SEO.

## YOUR RESPONSIBILITIES:
1. Add BREADCRUMBS to EVERY page (with Schema.org BreadcrumbList)
2. Add complete Schema.org structured data (LocalBusiness, Service, Organization)
3. Optimize meta tags (title, description, keywords, robots)
4. Add Open Graph and Twitter Card tags
5. Ensure semantic HTML5 structure (header, nav, main, section, article, footer)
6. Add proper aria-labels for accessibility
7. Ensure proper heading hierarchy (single H1, logical H2/H3)
8. Add alt attributes to all images
9. Add canonical URLs
10. Optimize internal linking

## BREADCRUMB STRUCTURE (MANDATORY ON ALL PAGES):
<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/">
        <span itemprop="name">Home</span>
      </a>
      <meta itemprop="position" content="1" />
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">[Current Page]</span>
      <meta itemprop="position" content="2" />
    </li>
  </ol>
</nav>

## BREADCRUMB CSS (add to styles.css if not present):
.breadcrumbs {
  padding: 0.75rem 5%;
  background: var(--background-alt, #f8fafc);
  border-bottom: 1px solid var(--border, #e5e7eb);
}
.breadcrumbs ol {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
  font-size: 0.875rem;
}
.breadcrumbs li {
  display: flex;
  align-items: center;
}
.breadcrumbs li:not(:last-child)::after {
  content: '/';
  margin-left: 0.5rem;
  color: var(--text-muted, #6b7280);
}
.breadcrumbs a {
  color: var(--primary, #2d5f88);
  text-decoration: none;
  transition: color 0.2s;
}
.breadcrumbs a:hover {
  text-decoration: underline;
}
.breadcrumbs li:last-child span {
  color: var(--text-muted, #6b7280);
}

## SCHEMA.ORG TEMPLATES:

### LocalBusiness (add to <head>):
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "[BUSINESS NAME]",
  "description": "[DESCRIPTION]",
  "image": "[LOGO URL]",
  "telephone": "[PHONE]",
  "email": "[EMAIL]",
  "url": "[WEBSITE URL]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[STREET]",
    "addressLocality": "[CITY]",
    "addressRegion": "[STATE]",
    "postalCode": "[ZIP]",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[LAT]",
    "longitude": "[LONG]"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "08:00",
    "closes": "18:00"
  },
  "priceRange": "$$"
}
</script>

### Service (for each service):
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "[SERVICE NAME]",
  "description": "[SERVICE DESCRIPTION]",
  "provider": {
    "@type": "LocalBusiness",
    "name": "[BUSINESS NAME]"
  },
  "areaServed": {
    "@type": "City",
    "name": "[CITY]"
  }
}
</script>

## META TAGS TEMPLATE (optimize existing or add if missing):
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="googlebot" content="index, follow">

<title>[Primary Keyword] | [Business Name] - [Location]</title>
<meta name="description" content="[150-160 chars with keyword and CTA]">
<meta name="keywords" content="[5-10 relevant keywords]">
<meta name="author" content="[Business Name]">

<link rel="canonical" href="[FULL PAGE URL]">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="[Business Name]">
<meta property="og:title" content="[Title]">
<meta property="og:description" content="[Description]">
<meta property="og:image" content="[Image URL 1200x630]">
<meta property="og:url" content="[Page URL]">
<meta property="og:locale" content="pt_BR">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Title]">
<meta name="twitter:description" content="[Description]">
<meta name="twitter:image" content="[Image URL]">

## SEMANTIC HTML REQUIREMENTS:
- <header role="banner"> for page header
- <nav role="navigation" aria-label="[description]"> for navigation
- <main role="main"> for main content
- <section aria-labelledby="section-id"> for content sections
- <article> for standalone content
- <aside> for sidebar content
- <footer role="contentinfo"> for page footer

## HEADING HIERARCHY:
- Only ONE <h1> per page (must match page intent)
- <h2> for major sections
- <h3> for subsections
- Never skip levels (h1 → h3)

## IMAGE OPTIMIZATION:
- All <img> must have descriptive alt="[description]"
- Add loading="lazy" for below-fold images
- Add width and height attributes

## RULES:
1. Return ALL files (modified and unmodified)
2. ONLY add SEO optimizations - do NOT change design or functionality
3. Preserve all existing CSS, JavaScript, and visual elements
4. Insert breadcrumbs right after <header> or <nav>
5. Keep the exact same file structure

## OUTPUT FORMAT:
Return ONLY valid JSON:
{
  "files": [
    {
      "path": "index.html",
      "name": "index.html",
      "type": "html",
      "content": "<!DOCTYPE html>..."
    }
  ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files, businessInfo } = await req.json();

    console.log("=== SEO SPECIALIST AGENT START ===");
    console.log("Files to optimize:", files?.length || 0);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch SEO-specific memories
    const memoryContext = await fetchSEOMemories(supabase);
    console.log("SEO Memory context loaded:", memoryContext ? "yes" : "no");

    const fullPrompt = seoSystemPrompt + memoryContext;

    const userMessage = `Optimize these website files for perfect SEO:

## Business Context:
${businessInfo ? JSON.stringify(businessInfo, null, 2) : "Extract business info from the content"}

## Current Files:
${JSON.stringify(files, null, 2)}

## MANDATORY TASKS:
1. Add breadcrumbs navigation to ALL HTML pages (after header/nav)
2. Add/optimize meta tags (title, description, OG, Twitter)
3. Add Schema.org LocalBusiness JSON-LD
4. Ensure semantic HTML structure
5. Add aria-labels and roles
6. Check heading hierarchy (single H1)
7. Add alt attributes to images
8. Add breadcrumb CSS to styles.css if not present

Return ALL files with SEO optimizations applied.`;

    console.log("Calling OpenAI GPT-4o-mini for SEO optimization...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: fullPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
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
      throw new Error("No content in SEO response");
    }

    if (finishReason === "length") {
      console.error("WARNING: SEO response was truncated!");
    }

    console.log("SEO Specialist response received, length:", content.length);

    // Parse JSON (response_format guarantees valid JSON)
    let optimizedFiles;
    try {
      optimizedFiles = JSON.parse(content);
    } catch (e) {
      console.error("JSON parse error:", e);
      console.error("Raw content preview:", content.substring(0, 500));
      throw new Error(`Failed to parse SEO response. finish_reason: ${finishReason}`);
    }

    console.log("=== SEO SPECIALIST COMPLETE ===");
    console.log("Optimized files:", optimizedFiles.files?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        files: optimizedFiles.files,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("SEO Specialist error:", error);
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
