-- Create table for storing generated project files
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, file_path)
);

-- Index for fast project file lookups
CREATE INDEX idx_project_files_project_id ON public.project_files(project_id);

-- Enable RLS
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access
CREATE POLICY "Public read project_files" ON public.project_files FOR SELECT USING (true);
CREATE POLICY "Public insert project_files" ON public.project_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update project_files" ON public.project_files FOR UPDATE USING (true);
CREATE POLICY "Public delete project_files" ON public.project_files FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_project_files_updated_at
  BEFORE UPDATE ON public.project_files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();