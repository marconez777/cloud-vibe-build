-- Create project_settings table for site customization
CREATE TABLE public.project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Visual Identity
  company_name TEXT,
  slogan TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  
  -- Contact Information
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  
  -- Social Links (JSON)
  social_links JSONB DEFAULT '{}',
  
  -- Business Hours (JSON)
  business_hours JSONB DEFAULT '{}',
  
  -- Custom Fields (flexible JSON)
  custom_fields JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Disable RLS for MVP (public access)
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read project_settings" ON public.project_settings FOR SELECT USING (true);
CREATE POLICY "Public insert project_settings" ON public.project_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update project_settings" ON public.project_settings FOR UPDATE USING (true);
CREATE POLICY "Public delete project_settings" ON public.project_settings FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_project_settings_updated_at
  BEFORE UPDATE ON public.project_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();