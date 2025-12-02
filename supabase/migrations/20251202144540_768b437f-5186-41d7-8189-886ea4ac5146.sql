-- Fix search_path for functions
CREATE OR REPLACE FUNCTION public.increment_version_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
  FROM public.layout_versions
  WHERE project_id = NEW.project_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_previous_versions_not_current()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.layout_versions
  SET is_current = false
  WHERE project_id = NEW.project_id AND id != NEW.id;
  RETURN NEW;
END;
$$;

-- Enable RLS on tables with public access policies (MVP)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_versions ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for MVP
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Public delete projects" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Public read layout_versions" ON public.layout_versions FOR SELECT USING (true);
CREATE POLICY "Public insert layout_versions" ON public.layout_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update layout_versions" ON public.layout_versions FOR UPDATE USING (true);
CREATE POLICY "Public delete layout_versions" ON public.layout_versions FOR DELETE USING (true);