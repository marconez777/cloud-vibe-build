import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, projectName } = await req.json();

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    console.log("Exporting project:", projectId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all files for this project
    const { data: files, error } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .order("file_path");

    if (error) {
      throw error;
    }

    if (!files || files.length === 0) {
      throw new Error("No files found for this project");
    }

    console.log("Found files:", files.length);

    // Create ZIP
    const zip = new JSZip();
    const folderName = (projectName || "website").toLowerCase().replace(/\s+/g, "-");

    // Process index.html to include component contents
    let indexContent = "";
    const componentsMap: Record<string, string> = {};

    // First, collect all components
    for (const file of files) {
      if (file.file_path.startsWith("components/")) {
        const componentName = file.file_name.replace(".html", "");
        componentsMap[componentName] = file.content;
      }
    }

    // Add files to ZIP
    for (const file of files) {
      let content = file.content;

      // If it's index.html, replace component placeholders
      if (file.file_path === "index.html") {
        // Replace {{component}} placeholders with actual content
        for (const [name, componentContent] of Object.entries(componentsMap)) {
          const placeholder = new RegExp(`{{\\s*${name}\\s*}}`, "gi");
          content = content.replace(placeholder, componentContent);
        }
        indexContent = content;
      }

      zip.file(`${folderName}/${file.file_path}`, content);
    }

    // Also create a compiled version with everything inline
    if (indexContent) {
      // Find CSS files and inline them
      let cssContent = "";
      for (const file of files) {
        if (file.file_type === "css") {
          cssContent += `/* ${file.file_name} */\n${file.content}\n\n`;
        }
      }

      // Find JS files
      let jsContent = "";
      for (const file of files) {
        if (file.file_type === "js") {
          jsContent += `/* ${file.file_name} */\n${file.content}\n\n`;
        }
      }

      // Create compiled single HTML file
      const compiledHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName || "Website"}</title>
  <style>
${cssContent}
  </style>
</head>
<body>
${indexContent.replace(/<html[^>]*>|<\/html>|<head>[\s\S]*?<\/head>|<!DOCTYPE[^>]*>/gi, "").replace(/<body[^>]*>|<\/body>/gi, "").trim()}
  <script>
${jsContent}
  </script>
</body>
</html>`;

      zip.file(`${folderName}/compiled.html`, compiledHtml);
    }

    // Generate ZIP
    const zipBlob = await zip.generateAsync({ type: "base64" });

    console.log("ZIP generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        zipData: zipBlob,
        filename: `${folderName}.zip`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in export-zip:", error);
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
