-- Create the locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    floor_level INTEGER,
    square_footage DECIMAL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(house_id, name)
);

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_locations_house_id ON locations(house_id);

-- Insert default locations for each house if they don't exist
INSERT INTO locations (house_id, name, description)
SELECT h.id, 'Living Room', 'Main living area'
FROM houses h
WHERE NOT EXISTS (
    SELECT 1 FROM locations l WHERE l.house_id = h.id AND l.name = 'Living Room'
);

INSERT INTO locations (house_id, name, description)
SELECT h.id, 'Kitchen', 'Kitchen area'
FROM houses h
WHERE NOT EXISTS (
    SELECT 1 FROM locations l WHERE l.house_id = h.id AND l.name = 'Kitchen'
);

INSERT INTO locations (house_id, name, description)
SELECT h.id, 'Walls', 'Exterior walls'
FROM houses h
WHERE NOT EXISTS (
    SELECT 1 FROM locations l WHERE l.house_id = h.id AND l.name = 'Walls'
);

INSERT INTO locations (house_id, name, description)
SELECT h.id, 'Trim', 'Interior trim and baseboards'
FROM houses h
WHERE NOT EXISTS (
    SELECT 1 FROM locations l WHERE l.house_id = h.id AND l.name = 'Trim'
);

INSERT INTO locations (house_id, name, description)
SELECT h.id, 'Garage Door', 'Garage door'
FROM houses h
WHERE NOT EXISTS (
    SELECT 1 FROM locations l WHERE l.house_id = h.id AND l.name = 'Garage Door'
);

-- Add location_id column to paint_records if it doesn't exist
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

-- Now let's check what locations we have
SELECT id, house_id, name FROM locations;

-- Let's check what paint records we have with invalid location_ids
SELECT pr.id, pr.location_id, pr.house_id, pr.paint_type
FROM paint_records pr
LEFT JOIN locations l ON pr.location_id = l.id
WHERE l.id IS NULL;

-- Drop the foreign key constraint temporarily
ALTER TABLE paint_records 
    DROP CONSTRAINT IF EXISTS paint_records_location_id_fkey;

-- Make location_id nullable temporarily
ALTER TABLE paint_records 
    ALTER COLUMN location_id DROP NOT NULL;

-- Create a temporary table to store the valid location IDs
CREATE TEMP TABLE valid_locations AS
SELECT DISTINCT l.id, l.house_id, l.name
FROM locations l;

-- Update paint records to use valid location IDs
UPDATE paint_records pr
SET location_id = (
    SELECT vl.id 
    FROM valid_locations vl
    WHERE vl.house_id = pr.house_id 
    AND vl.name = CASE 
        WHEN pr.paint_type = 'exterior' THEN 'Walls'
        ELSE 'Living Room'
    END
    LIMIT 1
)
WHERE pr.location_id IS NULL 
   OR pr.location_id NOT IN (SELECT id FROM valid_locations);

-- Add the foreign key constraint back
ALTER TABLE paint_records
    ADD CONSTRAINT paint_records_location_id_fkey 
    FOREIGN KEY (location_id) 
    REFERENCES locations(id) ON DELETE CASCADE;

-- Make location_id NOT NULL again
ALTER TABLE paint_records 
    ALTER COLUMN location_id SET NOT NULL;

-- Drop the temporary table
DROP TABLE valid_locations; 