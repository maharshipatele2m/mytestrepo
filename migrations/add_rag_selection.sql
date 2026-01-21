-- Add is_active column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add google_scopes column to profiles table to track granted permissions
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_scopes TEXT[];

-- Create index for faster queries on active documents
CREATE INDEX IF NOT EXISTS idx_documents_active ON documents(user_id, is_active) WHERE is_active = true;

-- Add RLS policy for updating document active status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own documents') THEN
        CREATE POLICY "Users can update their own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;
