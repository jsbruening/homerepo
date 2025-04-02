-- First, ensure the locations table exists and has the correct structure
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    floor_level INTEGER,
    square_footage NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default locations for each house if they don't exist
INSERT INTO locations (id, house_id, name, description, floor_level, square_footage)
SELECT 
    uuid_generate_v4(),
    h.id,
    'Living Room',
    'Main living area',
    1,
    400
FROM houses h
WHERE NOT EXISTS (
    SELECT 1 FROM locations l 
    WHERE l.house_id = h.id AND l.name = 'Living Room'
);

INSERT INTO locations (id, house_id, name, description, floor_level, square_footage)
SELECT 
    uuid_generate_v4(),
    h.id,
    'Kitchen',
    'Kitchen area',
    1,
    300
FROM houses h
WHERE NOT EXISTS (
    SELECT 1 FROM locations l 
    WHERE l.house_id = h.id AND l.name = 'Kitchen'
);

INSERT INTO locations (id, house_id, name, description, floor_level, square_footage)
SELECT 
    uuid_generate_v4(),
    h.id,
    'Walls',
    'Exterior walls',
    0,
    NULL
FROM houses h
WHERE NOT EXISTS (
    SELECT 1 FROM locations l 
    WHERE l.house_id = h.id AND l.name = 'Walls'
);

INSERT INTO locations (id, house_id, name, description, floor_level, square_footage)
SELECT 
    uuid_generate_v4(),
    h.id,
    'Trim',
    'Exterior trim',
    0,
    NULL
FROM houses h
WHERE NOT EXISTS (
    SELECT 1 FROM locations l 
    WHERE l.house_id = h.id AND l.name = 'Trim'
);

INSERT INTO locations (id, house_id, name, description, floor_level, square_footage)
SELECT 
    uuid_generate_v4(),
    h.id,
    'Garage Door',
    'Garage door',
    0,
    NULL
FROM houses h
WHERE NOT EXISTS (
    SELECT 1 FROM locations l 
    WHERE l.house_id = h.id AND l.name = 'Garage Door'
);

-- Drop existing foreign key constraints
ALTER TABLE paint_records 
    DROP CONSTRAINT IF EXISTS paint_records_room_id_fkey,
    DROP CONSTRAINT IF EXISTS paint_records_location_id_fkey,
    DROP CONSTRAINT IF EXISTS paint_records_manufacturer_id_fkey,
    DROP CONSTRAINT IF EXISTS paint_records_house_id_fkey;

-- Rename room_id to location_id if it exists
ALTER TABLE paint_records 
    RENAME COLUMN room_id TO location_id;

-- Add new foreign key constraints
ALTER TABLE paint_records
    ADD CONSTRAINT paint_records_manufacturer_id_fkey 
    FOREIGN KEY (manufacturer_id) 
    REFERENCES paint_manufacturers(id) ON DELETE CASCADE,
    ADD CONSTRAINT paint_records_location_id_fkey 
    FOREIGN KEY (location_id) 
    REFERENCES locations(id) ON DELETE CASCADE,
    ADD CONSTRAINT paint_records_house_id_fkey 
    FOREIGN KEY (house_id) 
    REFERENCES houses(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS paint_records_manufacturer_id_idx ON paint_records(manufacturer_id);
CREATE INDEX IF NOT EXISTS paint_records_location_id_idx ON paint_records(location_id);
CREATE INDEX IF NOT EXISTS paint_records_house_id_idx ON paint_records(house_id);

-- Update existing records to ensure they have valid location_id values
UPDATE paint_records pr
SET location_id = (
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
WHERE pr.location_id IS NULL;

-- Make location_id NOT NULL after ensuring all records have valid values
ALTER TABLE paint_records 
    ALTER COLUMN location_id SET NOT NULL;

-- Drop the location column since we're not using it anymore
ALTER TABLE paint_records 
    DROP COLUMN IF EXISTS location;

-- Ensure all required columns are NOT NULL
ALTER TABLE paint_records
    ALTER COLUMN manufacturer_id SET NOT NULL,
    ALTER COLUMN paint_type SET NOT NULL,
    ALTER COLUMN finish_type SET NOT NULL,
    ALTER COLUMN date SET NOT NULL;

-- Add check constraints for paint_type and finish_type
ALTER TABLE paint_records
    ADD CONSTRAINT paint_records_paint_type_check 
    CHECK (paint_type IN ('interior', 'exterior')),
    ADD CONSTRAINT paint_records_finish_type_check 
    CHECK (finish_type IN ('flat', 'eggshell', 'satin', 'semi-gloss', 'gloss')); 