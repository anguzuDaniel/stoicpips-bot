-- Add deriv_api_token column to bot_configs table
ALTER TABLE bot_configs 
ADD COLUMN IF NOT EXISTS deriv_api_token TEXT;

-- Optional: Add a comment
COMMENT ON COLUMN bot_configs.deriv_api_token IS 'User provided Deriv API Token for trading';
