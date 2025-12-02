export interface PageTemplate {
  id: string;
  project_id: string;
  name: string;
  source_file_path: string;
  tags: string[];
  output_pattern: string;
  output_folder: string;
  variations: TemplateVariation[];
  created_at: string;
  updated_at: string;
}

export interface TemplateVariation {
  [key: string]: string;
}

export interface GeneratedPage {
  fileName: string;
  filePath: string;
  content: string;
}
