-- Create table for custom AI agents
CREATE TABLE public.ai_agents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT 'blue',
  icon text DEFAULT 'bot',
  system_prompt text,
  is_active boolean DEFAULT true,
  is_system boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default system agents
INSERT INTO public.ai_agents (slug, name, description, color, icon, is_system) VALUES
  ('design_analyst', 'Design Analyst', 'Analisa imagens e define cores, fontes, layout', 'violet', 'palette', true),
  ('code_generator', 'Code Generator', 'Gera HTML, CSS e JavaScript', 'cyan', 'code', true),
  ('seo_specialist', 'SEO Specialist', 'Otimiza meta tags, Schema.org, breadcrumbs', 'amber', 'search', true),
  ('all', 'Compartilhadas', 'Memórias usadas por todos os agentes', 'emerald', 'share-2', true);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_agents_updated_at
  BEFORE UPDATE ON public.ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();