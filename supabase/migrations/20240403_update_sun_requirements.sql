-- First, drop the existing check constraint
ALTER TABLE plants
DROP CONSTRAINT IF EXISTS plants_sun_requirements_check;

-- Update existing values to match the new format
UPDATE plants
SET sun_requirements = 
  CASE sun_requirements
    WHEN 'full' THEN 'full sun'
    WHEN 'partial' THEN 'partial shade'
    WHEN 'shade' THEN 'no sun'
    ELSE sun_requirements
  END;

-- Add the new check constraint
ALTER TABLE plants
ADD CONSTRAINT plants_sun_requirements_check 
CHECK (sun_requirements IN ('no sun', 'partial shade', 'full sun')); 