-- Add location column for exterior paint
ALTER TABLE paint_records
ADD COLUMN location text;

-- Add a check constraint to ensure location is one of the valid values when paint_type is exterior
ALTER TABLE paint_records
ADD CONSTRAINT paint_records_location_check 
CHECK (
  (paint_type = 'exterior' AND location IN ('garage_door', 'trim', 'walls')) OR
  (paint_type != 'exterior' AND location IS NULL)
);

-- Make room_id nullable since it's not required for exterior paint
ALTER TABLE paint_records
ALTER COLUMN room_id DROP NOT NULL;

-- Add a check constraint to ensure either room_id or location is set
ALTER TABLE paint_records
ADD CONSTRAINT paint_records_room_or_location_check
CHECK (
  (paint_type = 'exterior' AND location IS NOT NULL AND room_id IS NULL) OR
  (paint_type != 'exterior' AND room_id IS NOT NULL AND location IS NULL)
);

-- Update existing records to set location based on room name for exterior paint
UPDATE paint_records pr
SET location = r.name
FROM rooms r
WHERE pr.paint_type = 'exterior' 
AND pr.room_id = r.id;

-- Set room_id to NULL for exterior paint records
UPDATE paint_records
SET room_id = NULL
WHERE paint_type = 'exterior'; 