-- Add finish_type column to paint_records table
ALTER TABLE paint_records
ADD COLUMN finish_type text NOT NULL DEFAULT 'flat';

-- Add a check constraint to ensure finish_type is one of the valid values
ALTER TABLE paint_records
ADD CONSTRAINT paint_records_finish_type_check 
CHECK (finish_type IN ('flat', 'eggshell', 'satin', 'semi-gloss', 'gloss')); 