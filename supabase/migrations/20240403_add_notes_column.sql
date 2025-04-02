-- Add notes column to plants table
ALTER TABLE plants
ADD COLUMN IF NOT EXISTS notes TEXT; 