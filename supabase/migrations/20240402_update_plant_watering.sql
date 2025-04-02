-- First, make the watering columns nullable
ALTER TABLE plants
ALTER COLUMN last_watered DROP NOT NULL,
ALTER COLUMN next_watering DROP NOT NULL;

-- Then set all existing values to null
UPDATE plants
SET last_watered = NULL,
    next_watering = NULL;

-- Finally, remove the columns
ALTER TABLE plants
DROP COLUMN last_watered,
DROP COLUMN next_watering; 