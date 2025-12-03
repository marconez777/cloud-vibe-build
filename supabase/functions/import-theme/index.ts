import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TEXT_EXTENSIONS = [
  ".html", ".htm", ".php", ".css", ".scss", ".sass", ".less",
  ".js", ".ts", ".jsx", ".tsx", ".json", ".xml", ".svg",
  ".txt", ".md", ".htaccess", ".gitignore"
];

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".ico", ".bmp"];
const FONT_EXTENSIONS = [".woff", ".woff2", ".ttf", ".eot", ".otf"];

function getFileType(fileName: string): string {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  if ([".html", ".htm"].includes(ext)) return "html";
  if (ext === ".php") return "php";
  if ([".css", ".scss", ".sass", ".less"].includes(ext)) return "css";
  if ([".js", ".ts", ".jsx", ".tsx"].includes(ext)) return "js";
  if (ext === ".json") return "json";
  if (ext === ".xml") return "xml";
  if (ext === ".svg") return "svg";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (FONT_EXTENSIONS.includes(ext)) return "font";
  return "other";
}

function isTextFile(fileName: string): boolean {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  return TEXT_EXTENSIONS.includes(ext);
}

function isBinaryFile(fileName: string): boolean {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf("."));
  return IMAGE_EXTENSIONS.includes(ext) || FONT_EXTENSIONS.includes(ext);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const zipFile = formData.get("file") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const category = formData.get("category") as string || "general";
    const tagsRaw = formData.get("tags") as string | null;
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

    if (!zipFile || !name) {
      return new Response(
        JSON.stringify({ error: "Arquivo ZIP e nome são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing theme upload: ${name}, file: ${zipFile.name}, size: ${zipFile.size}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Read ZIP file
    const arrayBuffer = await zipFile.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Create theme record first
    const { data: theme, error: themeError } = await supabase
      .from("themes")
      .insert({
        name,
        description,
        category,
        tags,
        file_count: 0,
        total_size_bytes: 0,
      })
      .select()
      .single();

    if (themeError) {
      console.error("Error creating theme:", themeError);
      throw themeError;
    }

    console.log(`Created theme: ${theme.id}`);

    const themeFiles: any[] = [];
    let totalSize = 0;
    let previewImageUrl: string | null = null;

    // Process each file in the ZIP
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;

      // Skip hidden files and __MACOSX
      if (relativePath.startsWith("__MACOSX") || relativePath.includes("/._")) continue;
      if (relativePath.startsWith(".")) continue;

      const fileName = relativePath.split("/").pop() || relativePath;
      const fileType = getFileType(fileName);

      console.log(`Processing file: ${relativePath}, type: ${fileType}`);

      if (isTextFile(fileName)) {
        // Text file - store content directly
        const content = await zipEntry.async("string");
        totalSize += content.length;

        themeFiles.push({
          theme_id: theme.id,
          file_path: relativePath,
          file_name: fileName,
          file_type: fileType,
          content,
          size_bytes: content.length,
        });
      } else if (isBinaryFile(fileName)) {
        // Binary file - upload to storage
        const blob = await zipEntry.async("blob");
        const storagePath = `${theme.id}/${relativePath}`;

        const { error: uploadError } = await supabase.storage
          .from("theme-assets")
          .upload(storagePath, blob, {
            contentType: blob.type || "application/octet-stream",
          });

        if (uploadError) {
          console.error(`Error uploading ${relativePath}:`, uploadError);
          continue;
        }

        const { data: publicUrl } = supabase.storage
          .from("theme-assets")
          .getPublicUrl(storagePath);

        totalSize += blob.size;

        themeFiles.push({
          theme_id: theme.id,
          file_path: relativePath,
          file_name: fileName,
          file_type: fileType,
          storage_url: publicUrl.publicUrl,
          size_bytes: blob.size,
        });

        // Use first image as preview
        if (!previewImageUrl && IMAGE_EXTENSIONS.some(ext => fileName.toLowerCase().endsWith(ext))) {
          previewImageUrl = publicUrl.publicUrl;
        }
      }
    }

    // Insert all theme files
    if (themeFiles.length > 0) {
      const { error: filesError } = await supabase
        .from("theme_files")
        .insert(themeFiles);

      if (filesError) {
        console.error("Error inserting theme files:", filesError);
        // Cleanup theme on error
        await supabase.from("themes").delete().eq("id", theme.id);
        throw filesError;
      }
    }

    // Update theme with file count and preview
    const { error: updateError } = await supabase
      .from("themes")
      .update({
        file_count: themeFiles.length,
        total_size_bytes: totalSize,
        preview_image_url: previewImageUrl,
      })
      .eq("id", theme.id);

    if (updateError) {
      console.error("Error updating theme:", updateError);
    }

    console.log(`Theme import complete: ${themeFiles.length} files, ${totalSize} bytes`);

    return new Response(
      JSON.stringify({
        success: true,
        theme: {
          ...theme,
          file_count: themeFiles.length,
          total_size_bytes: totalSize,
          preview_image_url: previewImageUrl,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in import-theme:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao importar tema";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
