-- Add user_id column to records table for user association
ALTER TABLE records 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);

-- Create index for user-specific queries
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);

-- Update existing records to have a default user_id (optional - for migration)
-- This can be removed if starting fresh
UPDATE records 
SET user_id = 'anonymous' 
WHERE user_id IS NULL;
