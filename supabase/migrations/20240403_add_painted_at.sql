-- Add painted_at column to paint_records table
ALTER TABLE paint_records ADD COLUMN painted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to use created_at as painted_at
UPDATE paint_records SET painted_at = created_at WHERE painted_at IS NULL; 