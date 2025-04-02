-- First, rename the rooms table to locations
ALTER TABLE rooms RENAME TO locations;

-- Add any missing locations for exterior locations if needed
INSERT INTO locations (id, name, description, house_id, created_at, updated_at)
SELECT 
  uuid_generate_v4(),
  'Walls',
  'Exterior walls',
  h.id,
  NOW(),
  NOW()
FROM houses h
WHERE NOT EXISTS (
  SELECT 1 FROM locations l 
  WHERE l.house_id = h.id AND l.name = 'Walls'
);

INSERT INTO locations (id, name, description, house_id, created_at, updated_at)
SELECT 
  uuid_generate_v4(),
  'Trim',
  'Exterior trim',
  h.id,
  NOW(),
  NOW()
FROM houses h
WHERE NOT EXISTS (
  SELECT 1 FROM locations l 
  WHERE l.house_id = h.id AND l.name = 'Trim'
);

INSERT INTO locations (id, name, description, house_id, created_at, updated_at)
SELECT 
  uuid_generate_v4(),
  'Garage Door',
  'Garage door',
  h.id,
  NOW(),
  NOW()
FROM houses h
WHERE NOT EXISTS (
  SELECT 1 FROM locations l 
  WHERE l.house_id = h.id AND l.name = 'Garage Door'
);

-- First, drop the constraint so we can update the data
ALTER TABLE paint_records DROP CONSTRAINT IF EXISTS paint_records_room_or_location_check;

-- Update existing paint records with NULL room_id
UPDATE paint_records pr
SET room_id = (
  SELECT l.id 
  FROM locations l 
  WHERE l.house_id = pr.house_id 
  AND l.name = CASE 
    WHEN pr.paint_type = 'exterior' THEN 
      CASE pr.location
        WHEN 'walls' THEN 'Walls'
        WHEN 'trim' THEN 'Trim'
        WHEN 'garage_door' THEN 'Garage Door'
        ELSE 'Walls'
      END
    ELSE 'Living Room' -- Default to Living Room for interior paint
  END
  LIMIT 1
)
WHERE pr.room_id IS NULL;

-- Now we can safely make room_id NOT NULL
ALTER TABLE paint_records ALTER COLUMN room_id SET NOT NULL;

-- Finally, drop the location column since we're not using it anymore
ALTER TABLE paint_records DROP COLUMN IF EXISTS location;

-- Rename room_id to location_id in paint_records
ALTER TABLE paint_records RENAME COLUMN room_id TO location_id;

-- Update the foreign key constraint
ALTER TABLE paint_records 
  DROP CONSTRAINT IF EXISTS paint_records_room_id_fkey,
  ADD CONSTRAINT paint_records_location_id_fkey 
  FOREIGN KEY (location_id) 
  REFERENCES locations(id); 