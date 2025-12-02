-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'error')),
  layout_tree JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create layout_versions table
CREATE TABLE public.layout_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  layout_tree JSONB NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  commit_message TEXT,
  created_by TEXT,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function for auto-increment version_number
CREATE OR REPLACE FUNCTION public.increment_version_number()
RETURNS TRIGGER AS $$
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
  FROM public.layout_versions
  WHERE project_id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-increment
CREATE TRIGGER trigger_increment_version_number
BEFORE INSERT ON public.layout_versions
FOR EACH ROW
EXECUTE FUNCTION public.increment_version_number();

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Set is_current to false for previous versions when inserting new one
CREATE OR REPLACE FUNCTION public.set_previous_versions_not_current()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.layout_versions
  SET is_current = false
  WHERE project_id = NEW.project_id AND id != NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_previous_versions_not_current
AFTER INSERT ON public.layout_versions
FOR EACH ROW
EXECUTE FUNCTION public.set_previous_versions_not_current();

-- Create storage bucket for project assets
INSERT INTO storage.buckets (id, name, public) VALUES ('project-assets', 'project-assets', true);

-- Storage policies for public access
CREATE POLICY "Public can view project assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-assets');

CREATE POLICY "Anyone can upload project assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-assets');

CREATE POLICY "Anyone can update project assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-assets');

CREATE POLICY "Anyone can delete project assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'project-assets');

-- Create indexes for better performance
CREATE INDEX idx_layout_versions_project_id ON public.layout_versions(project_id);
CREATE INDEX idx_layout_versions_is_current ON public.layout_versions(is_current);
CREATE INDEX idx_projects_status ON public.projects(status);