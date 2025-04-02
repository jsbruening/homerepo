-- Remove watering-related columns from plants table
ALTER TABLE plants
DROP COLUMN last_watered,
DROP COLUMN next_watering; 