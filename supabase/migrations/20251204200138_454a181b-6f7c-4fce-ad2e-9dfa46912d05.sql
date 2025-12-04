-- Add model column to ai_agents table
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS model text DEFAULT 'gpt-4o';

-- Update system agents with appropriate default models
UPDATE ai_agents SET model = 'gpt-4o' WHERE slug = 'design_analyst';
UPDATE ai_agents SET model = 'gpt-4o' WHERE slug = 'code_generator';
UPDATE ai_agents SET model = 'gpt-4o-mini' WHERE slug = 'seo_specialist';