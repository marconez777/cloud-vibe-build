-- Create page_templates table for storing template configurations
CREATE TABLE public.page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_file_path TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  output_pattern TEXT NOT NULL DEFAULT '{slug}.html',
  output_folder TEXT DEFAULT 'pages',
  variations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_page_templates_project_id ON public.page_templates(project_id);

-- Disable RLS for MVP (consistent with other tables)
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read page_templates" ON public.page_templates
FOR SELECT USING (true);

CREATE POLICY "Public insert page_templates" ON public.page_templates
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update page_templates" ON public.page_templates
FOR UPDATE USING (true);

CREATE POLICY "Public delete page_templates" ON public.page_templates
FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_page_templates_updated_at
BEFORE UPDATE ON public.page_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();