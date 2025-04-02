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

-- Drop existing foreign key constraints if they exist
ALTER TABLE paint_records 
    DROP CONSTRAINT IF EXISTS paint_records_room_id_fkey,
    DROP CONSTRAINT IF EXISTS paint_records_location_id_fkey;

-- Rename room_id to location_id if it exists
ALTER TABLE paint_records 
    RENAME COLUMN room_id TO location_id;

-- Add the foreign key constraint
ALTER TABLE paint_records 
    ADD CONSTRAINT paint_records_location_id_fkey 
    FOREIGN KEY (location_id) 
    REFERENCES locations(id);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_paint_records_location_id 
    ON paint_records(location_id);

-- Update any existing records to use the correct location IDs
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

-- Make location_id NOT NULL after ensuring all records have a valid location
ALTER TABLE paint_records 
    ALTER COLUMN location_id SET NOT NULL; 