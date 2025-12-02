-- Add category column to ai_memories table
ALTER TABLE public.ai_memories 
ADD COLUMN category text DEFAULT 'general';