-- Add agent column to ai_memories table
ALTER TABLE public.ai_memories 
ADD COLUMN agent TEXT DEFAULT 'all';

-- Update existing memories with appropriate agent assignments
UPDATE public.ai_memories SET agent = 'code_generator' WHERE title ILIKE '%SEO%' OR title ILIKE '%Performance%' OR title ILIKE '%Animações%' OR title ILIKE '%CSS%' OR title ILIKE '%Menu%' OR title ILIKE '%Pipeline%';
UPDATE public.ai_memories SET agent = 'design_analyst' WHERE title ILIKE '%Fontes%' OR title ILIKE '%Fidelidade%' OR title ILIKE '%Padrões de Design%' OR title ILIKE '%Cores%';
UPDATE public.ai_memories SET agent = 'all' WHERE agent IS NULL OR (title ILIKE '%Template%' OR title ILIKE '%Clínica%' OR title ILIKE '%Serviços%');