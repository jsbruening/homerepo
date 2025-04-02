-- First, drop existing foreign key constraints if they exist
ALTER TABLE paint_records 
    DROP CONSTRAINT IF EXISTS paint_records_room_id_fkey,
    DROP CONSTRAINT IF EXISTS paint_records_location_id_fkey;

-- Create the locations table if it doesn't exist
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

-- Check if room_id exists and rename it to location_id if it does
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'paint_records' 
        AND column_name = 'room_id'
    ) THEN
        ALTER TABLE paint_records RENAME COLUMN room_id TO location_id;
    END IF;
END $$;

-- Add location_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'paint_records' 
        AND column_name = 'location_id'
    ) THEN
        ALTER TABLE paint_records ADD COLUMN location_id UUID;
    END IF;
END $$;

-- Make location_id nullable temporarily
ALTER TABLE paint_records 
    ALTER COLUMN location_id DROP NOT NULL;

-- Update existing records to ensure they have valid location_id values
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'paint_records' 
        AND column_name = 'location'
    ) THEN
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
    ELSE
        -- If location column doesn't exist, default all records to Living Room
        UPDATE paint_records pr
        SET location_id = (
            SELECT l.id 
            FROM locations l 
            WHERE l.house_id = pr.house_id 
            AND l.name = 'Living Room'
            LIMIT 1
        )
        WHERE pr.location_id IS NULL;
    END IF;
END $$;

-- Drop the location column since we're not using it anymore
ALTER TABLE paint_records 
    DROP COLUMN IF EXISTS location;

-- Add new foreign key constraint
ALTER TABLE paint_records
    ADD CONSTRAINT paint_records_location_id_fkey 
    FOREIGN KEY (location_id) 
    REFERENCES locations(id) ON DELETE CASCADE;

-- Make location_id NOT NULL after ensuring all records have valid values
ALTER TABLE paint_records 
    ALTER COLUMN location_id SET NOT NULL; 