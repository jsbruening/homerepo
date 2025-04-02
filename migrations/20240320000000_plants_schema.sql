-- Drop existing tables if they exist
DROP TABLE IF EXISTS plants CASCADE;

-- Create plants table
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('indoor', 'outdoor')),
    location VARCHAR(255) NOT NULL,
    max_height INTEGER,
    max_width INTEGER,
    sun_requirements VARCHAR(50) NOT NULL CHECK (sun_requirements IN ('full', 'partial', 'shade')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on house_id for faster lookups
CREATE INDEX idx_plants_house_id ON plants(house_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO plants (house_id, name, type, location, max_height, max_width, sun_requirements)
VALUES
    -- Indoor plants
    ((SELECT id FROM houses LIMIT 1), 'Monstera Deliciosa', 'indoor', 'Living Room', 200, 150, 'partial'),
    ((SELECT id FROM houses LIMIT 1), 'Snake Plant', 'indoor', 'Bedroom', 120, 60, 'shade'),
    ((SELECT id FROM houses LIMIT 1), 'Peace Lily', 'indoor', 'Kitchen', 100, 80, 'partial'),
    ((SELECT id FROM houses LIMIT 1), 'Spider Plant', 'indoor', 'Office', 60, 60, 'partial'),
    ((SELECT id FROM houses LIMIT 1), 'ZZ Plant', 'indoor', 'Bathroom', 90, 90, 'shade'),
    
    -- Outdoor plants
    ((SELECT id FROM houses LIMIT 1), 'Japanese Maple', 'outdoor', 'Front Yard', 400, 300, 'partial'),
    ((SELECT id FROM houses LIMIT 1), 'Lavender', 'outdoor', 'Garden Bed', 60, 60, 'full'),
    ((SELECT id FROM houses LIMIT 1), 'Hydrangea', 'outdoor', 'Back Yard', 150, 150, 'partial'),
    ((SELECT id FROM houses LIMIT 1), 'Rosemary', 'outdoor', 'Herb Garden', 120, 90, 'full'),
    ((SELECT id FROM houses LIMIT 1), 'Hostas', 'outdoor', 'Shade Garden', 60, 90, 'shade'); 