-- Allow seo_specialist as agent type
-- Note: PostgreSQL doesn't have enum constraints on text columns by default
-- The existing agent column is just text, so we just need to ensure
-- the new value works with any existing constraints

-- Verify the column accepts the new value (it should since it's text)
-- No constraint changes needed - the agent column is text without check constraints