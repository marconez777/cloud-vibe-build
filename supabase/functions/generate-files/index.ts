import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `You are a professional web developer. Generate a complete, modern website with multiple files.

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

REQUIRED FILES TO GENERATE:
1. index.html - Main page with proper HTML5 structure
2. css/variables.css - CSS custom properties (colors, fonts, spacing)
3. css/styles.css - Main stylesheet with all component styles
4. css/responsive.css - Media queries for responsive design
5. components/header.html - Header/navigation component
6. components/footer.html - Footer component
7. js/main.js - Main JavaScript file

GUIDELINES:
- Use modern, semantic HTML5
- Include CSS custom properties for theming
- Make it fully responsive (mobile-first)
- Use modern CSS (flexbox, grid)
- Add smooth transitions and hover effects
- Include accessibility features (aria labels, semantic tags)
- JavaScript should be vanilla ES6+
- All styles must be in external CSS files
- Components should be reusable HTML snippets
- Include placeholders like {{header}} and {{footer}} in index.html that reference components

COLOR SCHEME: Use the provided primary and secondary colors, or choose a professional, modern palette if not specified.

SECTIONS TO INCLUDE (based on briefing):
- Hero section with headline and CTA
- Features/Services section
- About section
- Testimonials (if applicable)
- Contact section
- Footer with links

Make the design professional, modern, and visually appealing with proper spacing, typography, and visual hierarchy.`;

const editSystemPrompt = `You are a professional web developer. Modify the existing website files based on user instructions.

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
2. Preserve all existing functionality and styling
3. Return ALL files, even unmodified ones
4. Maintain consistency across all files
5. Keep the same file structure`;

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

    // Build messages array
    const messages = [];

    if (editMode && currentFiles) {
      messages.push({
        role: "system",
        content: editSystemPrompt,
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
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

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
