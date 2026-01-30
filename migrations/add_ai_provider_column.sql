-- Add ai_provider column to bot_configs table
ALTER TABLE bot_configs
ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'local';

COMMENT ON COLUMN bot_configs.ai_provider IS 'AI Provider selection (local or openai)';
