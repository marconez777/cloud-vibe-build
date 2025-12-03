-- Create themes table for storing theme metadata
CREATE TABLE public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  preview_image_url TEXT,
  file_count INTEGER DEFAULT 0,
  total_size_bytes BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create theme_files table for storing extracted files
CREATE TABLE public.theme_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  content TEXT,
  storage_url TEXT,
  size_bytes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(theme_id, file_path)
);

-- Disable RLS for MVP
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_files ENABLE ROW LEVEL SECURITY;

-- Create public access policies for themes
CREATE POLICY "Public read themes" ON public.themes FOR SELECT USING (true);
CREATE POLICY "Public insert themes" ON public.themes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update themes" ON public.themes FOR UPDATE USING (true);
CREATE POLICY "Public delete themes" ON public.themes FOR DELETE USING (true);

-- Create public access policies for theme_files
CREATE POLICY "Public read theme_files" ON public.theme_files FOR SELECT USING (true);
CREATE POLICY "Public insert theme_files" ON public.theme_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update theme_files" ON public.theme_files FOR UPDATE USING (true);
CREATE POLICY "Public delete theme_files" ON public.theme_files FOR DELETE USING (true);

-- Create trigger for updated_at on themes
CREATE TRIGGER update_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster theme_files lookup
CREATE INDEX idx_theme_files_theme_id ON public.theme_files(theme_id);

-- Create storage bucket for theme assets
INSERT INTO storage.buckets (id, name, public) VALUES ('theme-assets', 'theme-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for theme-assets bucket
CREATE POLICY "Public read theme-assets" ON storage.objects FOR SELECT USING (bucket_id = 'theme-assets');
CREATE POLICY "Public insert theme-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'theme-assets');
CREATE POLICY "Public delete theme-assets" ON storage.objects FOR DELETE USING (bucket_id = 'theme-assets');