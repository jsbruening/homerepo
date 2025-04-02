-- Create houses table
CREATE TABLE houses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    owners TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    floor_level INTEGER,
    square_footage NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create paint_manufacturers table
CREATE TABLE paint_manufacturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_types table
CREATE TABLE service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recurrences table
CREATE TABLE recurrences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    value TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create paint_records table
CREATE TABLE paint_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    manufacturer_id UUID REFERENCES paint_manufacturers(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    color_code TEXT NOT NULL,
    paint_type TEXT NOT NULL CHECK (paint_type IN ('interior', 'exterior')),
    finish_type TEXT NOT NULL CHECK (finish_type IN ('flat', 'eggshell', 'satin', 'semi-gloss', 'gloss')),
    location TEXT,
    painted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT paint_records_location_check CHECK (
        (paint_type = 'exterior' AND location IN ('garage_door', 'trim', 'walls')) OR
        (paint_type != 'exterior' AND location IS NULL)
    ),
    CONSTRAINT paint_records_room_or_location_check CHECK (
        (paint_type = 'exterior' AND location IS NOT NULL AND room_id IS NULL) OR
        (paint_type != 'exterior' AND room_id IS NOT NULL AND location IS NULL)
    )
);

-- Create home_services table
CREATE TABLE home_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    service_type_id UUID REFERENCES service_types(id),
    provider TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
    recurrence_id UUID REFERENCES recurrences(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plants table
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('indoor', 'outdoor')),
    location TEXT NOT NULL,
    max_height NUMERIC,
    max_width NUMERIC,
    sun_requirements TEXT NOT NULL CHECK (sun_requirements IN ('no sun', 'partial shade', 'full sun')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    recurrence_id UUID REFERENCES recurrences(id),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_houses_updated_at
    BEFORE UPDATE ON houses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paint_records_updated_at
    BEFORE UPDATE ON paint_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_home_services_updated_at
    BEFORE UPDATE ON home_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at
    BEFORE UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
    BEFORE UPDATE ON reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_rooms_house_id ON rooms(house_id);
CREATE INDEX idx_paint_records_house_id ON paint_records(house_id);
CREATE INDEX idx_paint_records_room_id ON paint_records(room_id);
CREATE INDEX idx_paint_records_manufacturer_id ON paint_records(manufacturer_id);
CREATE INDEX idx_home_services_house_id ON home_services(house_id);
CREATE INDEX idx_home_services_service_type_id ON home_services(service_type_id);
CREATE INDEX idx_home_services_recurrence_id ON home_services(recurrence_id);
CREATE INDEX idx_reminders_house_id ON reminders(house_id);
CREATE INDEX idx_reminders_recurrence_id ON reminders(recurrence_id);
CREATE INDEX idx_plants_house_id ON plants(house_id);

-- Insert reference data

-- Insert paint manufacturers
INSERT INTO paint_manufacturers (name, website) VALUES
    ('Benjamin Moore', 'https://www.benjaminmoore.com'),
    ('Sherwin-Williams', 'https://www.sherwin-williams.com'),
    ('Behr', 'https://www.behr.com'),
    ('Valspar', 'https://www.valspar.com'),
    ('PPG', 'https://www.ppg.com');

-- Insert service types
INSERT INTO service_types (name, description, category) VALUES
    -- HVAC Services
    ('HVAC Maintenance', 'Regular maintenance of heating and cooling systems', 'HVAC'),
    ('Air Filter Replacement', 'Replacement of HVAC air filters', 'HVAC'),
    ('Duct Cleaning', 'Cleaning of HVAC ductwork', 'HVAC'),
    
    -- Plumbing Services
    ('Plumbing Repair', 'General plumbing repairs and maintenance', 'Plumbing'),
    ('Water Heater Service', 'Water heater maintenance and repair', 'Plumbing'),
    ('Drain Cleaning', 'Cleaning of clogged drains', 'Plumbing'),
    
    -- Electrical Services
    ('Electrical Repair', 'General electrical repairs and maintenance', 'Electrical'),
    ('Lighting Installation', 'Installation of new lighting fixtures', 'Electrical'),
    ('Circuit Panel Service', 'Electrical panel maintenance and upgrades', 'Electrical'),
    
    -- Landscaping Services
    ('Landscaping', 'General landscaping maintenance', 'Landscaping'),
    ('Tree Trimming', 'Tree maintenance and trimming', 'Landscaping'),
    ('Lawn Care', 'Lawn maintenance and care', 'Landscaping'),
    
    -- Cleaning Services
    ('House Cleaning', 'General house cleaning service', 'Cleaning'),
    ('Window Cleaning', 'Window cleaning service', 'Cleaning'),
    ('Carpet Cleaning', 'Carpet cleaning service', 'Cleaning'),
    
    -- Pool Services
    ('Pool Maintenance', 'Regular pool maintenance and cleaning', 'Pool'),
    ('Pool Repair', 'Pool repair and maintenance', 'Pool'),
    ('Pool Opening/Closing', 'Seasonal pool opening and closing', 'Pool'),
    
    -- Other Services
    ('Pest Control', 'Pest control and extermination', 'Other'),
    ('Roof Repair', 'Roof maintenance and repair', 'Other'),
    ('Gutter Cleaning', 'Gutter cleaning and maintenance', 'Other');

-- Insert recurrences
INSERT INTO recurrences (name, value, description) VALUES
    ('One-time', 'one-time', 'Occurs only once'),
    ('Daily', 'daily', 'Occurs every day'),
    ('Weekly', 'weekly', 'Occurs every week'),
    ('Monthly', 'monthly', 'Occurs every month'),
    ('Quarterly', 'quarterly', 'Occurs every three months'),
    ('Semi-annual', 'semi-annual', 'Occurs every six months'),
    ('Annual', 'annual', 'Occurs every year');

-- Insert test data

-- Insert houses
INSERT INTO houses (name, address, owners) VALUES
    ('Main House', '123 Main St, Anytown, USA', ARRAY['John Doe', 'Jane Doe']),
    ('Vacation Home', '456 Beach Rd, Seaside, USA', ARRAY['John Doe', 'Jane Doe']);

-- Insert rooms for Main House
INSERT INTO rooms (house_id, name, description, floor_level, square_footage)
SELECT 
    h.id,
    r.name,
    r.description,
    r.floor_level,
    r.square_footage
FROM houses h
CROSS JOIN (VALUES
    ('Living Room', 'Main living area with fireplace', 1, 400),
    ('Kitchen', 'Open concept kitchen with island', 1, 300),
    ('Dining Room', 'Formal dining area', 1, 200),
    ('Family Room', 'Casual living space', 1, 350),
    ('Foyer', 'Entryway', 1, 100),
    ('Powder Room', 'Half bathroom', 1, 50),
    ('Garage', 'Two car garage', 1, 600),
    ('Mudroom', 'Entry from garage', 1, 80),
    ('Master Bedroom', 'Primary bedroom with en suite', 2, 400),
    ('Master Bathroom', 'En suite bathroom', 2, 150),
    ('Bedroom 2', 'Guest bedroom', 2, 200),
    ('Bedroom 3', 'Children''s bedroom', 2, 200),
    ('Bedroom 4', 'Office/guest room', 2, 200),
    ('Bathroom 2', 'Shared bathroom', 2, 100),
    ('Bathroom 3', 'En suite bathroom', 2, 100),
    ('Laundry Room', 'Second floor laundry', 2, 100),
    ('Basement', 'Finished basement', 0, 800),
    ('Storage Room', 'Unfinished storage area', 0, 400),
    ('Utility Room', 'HVAC and water heater', 0, 200)
) AS r(name, description, floor_level, square_footage)
WHERE h.name = 'Main House';

-- Insert rooms for Vacation Home
INSERT INTO rooms (house_id, name, description, floor_level, square_footage)
SELECT 
    h.id,
    r.name,
    r.description,
    r.floor_level,
    r.square_footage
FROM houses h
CROSS JOIN (VALUES
    ('Living Room', 'Open concept living area with ocean view', 1, 500),
    ('Kitchen', 'Modern kitchen with breakfast bar', 1, 300),
    ('Dining Room', 'Casual dining area', 1, 200),
    ('Master Bedroom', 'Oceanfront master suite', 1, 400),
    ('Master Bathroom', 'En suite bathroom with jacuzzi', 1, 200),
    ('Bedroom 2', 'Guest bedroom', 1, 200),
    ('Bathroom 2', 'Shared bathroom', 1, 100),
    ('Laundry Room', 'First floor laundry', 1, 100),
    ('Deck', 'Oceanfront deck', 1, 400),
    ('Patio', 'Outdoor living space', 0, 300),
    ('Garage', 'Single car garage', 1, 300)
) AS r(name, description, floor_level, square_footage)
WHERE h.name = 'Vacation Home';

-- Insert paint records for Main House
INSERT INTO paint_records (house_id, room_id, manufacturer_id, color_name, color_code, paint_type, finish_type, painted_at)
SELECT 
    h.id,
    r.id,
    pm.id,
    pr.color_name,
    pr.color_code,
    pr.paint_type,
    pr.finish_type,
    pr.painted_at::TIMESTAMP WITH TIME ZONE
FROM houses h
CROSS JOIN rooms r
CROSS JOIN paint_manufacturers pm
CROSS JOIN (VALUES
    ('Simply White', 'OC-117', 'interior', 'eggshell', '2024-01-15'),
    ('Agreeable Gray', 'SW 7029', 'interior', 'eggshell', '2024-01-15'),
    ('Naval', 'SW 6244', 'interior', 'satin', '2024-01-15'),
    ('Pure White', 'SW 7005', 'exterior', 'satin', '2024-02-01'),
    ('Iron Gate', 'SW 7069', 'exterior', 'semi-gloss', '2024-02-01')
) AS pr(color_name, color_code, paint_type, finish_type, painted_at)
WHERE h.name = 'Main House'
AND r.name = 'Living Room'
AND pm.name = 'Benjamin Moore';

-- Insert paint records for Vacation Home
INSERT INTO paint_records (house_id, room_id, manufacturer_id, color_name, color_code, paint_type, finish_type, painted_at)
SELECT 
    h.id,
    r.id,
    pm.id,
    pr.color_name,
    pr.color_code,
    pr.paint_type,
    pr.finish_type,
    pr.painted_at::TIMESTAMP WITH TIME ZONE
FROM houses h
CROSS JOIN rooms r
CROSS JOIN paint_manufacturers pm
CROSS JOIN (VALUES
    ('Beach Glass', 'OC-123', 'interior', 'eggshell', '2024-01-20'),
    ('Sea Salt', 'SW 6204', 'interior', 'eggshell', '2024-01-20'),
    ('Coastal Blue', 'SW 6473', 'interior', 'satin', '2024-01-20'),
    ('White Sand', 'SW 7006', 'exterior', 'satin', '2024-02-15'),
    ('Ocean Blue', 'SW 6474', 'exterior', 'semi-gloss', '2024-02-15')
) AS pr(color_name, color_code, paint_type, finish_type, painted_at)
WHERE h.name = 'Vacation Home'
AND r.name = 'Living Room'
AND pm.name = 'Benjamin Moore';

-- Insert home services for Main House
INSERT INTO home_services (house_id, service_type_id, provider, date, status, recurrence_id, notes)
SELECT 
    h.id,
    st.id,
    'Local HVAC Company',
    NOW() + INTERVAL '1 month',
    'scheduled',
    r.id,
    'Regular maintenance check'
FROM houses h
CROSS JOIN service_types st
CROSS JOIN recurrences r
WHERE h.name = 'Main House'
AND st.name = 'HVAC Maintenance'
AND r.name = 'Quarterly';

-- Insert home services for Vacation Home
INSERT INTO home_services (house_id, service_type_id, provider, date, status, recurrence_id, notes)
SELECT 
    h.id,
    st.id,
    'Beach Pool Service',
    NOW() + INTERVAL '2 weeks',
    'scheduled',
    r.id,
    'Regular pool cleaning and maintenance'
FROM houses h
CROSS JOIN service_types st
CROSS JOIN recurrences r
WHERE h.name = 'Vacation Home'
AND st.name = 'Pool Maintenance'
AND r.name = 'Monthly';

-- Insert plants for Main House
INSERT INTO plants (house_id, name, type, location, max_height, max_width, sun_requirements, notes)
SELECT 
    h.id,
    'Snake Plant',
    'indoor',
    'Living Room',
    3,
    1,
    'partial shade',
    'Low maintenance plant'
FROM houses h
WHERE h.name = 'Main House';

-- Insert plants for Vacation Home
INSERT INTO plants (house_id, name, type, location, max_height, max_width, sun_requirements, notes)
SELECT 
    h.id,
    'Palm Tree',
    'outdoor',
    'Patio',
    15,
    8,
    'full sun',
    'Tropical palm tree'
FROM houses h
WHERE h.name = 'Vacation Home';

-- Insert reminders for Main House
INSERT INTO reminders (house_id, title, details, due_date, recurrence_id, completed)
SELECT 
    h.id,
    'Change HVAC Filter',
    'Replace the HVAC filter in the utility room',
    NOW() + INTERVAL '1 month',
    r.id,
    FALSE
FROM houses h
CROSS JOIN recurrences r
WHERE h.name = 'Main House'
AND r.name = 'Monthly';

-- Insert reminders for Vacation Home
INSERT INTO reminders (house_id, title, details, due_date, recurrence_id, completed)
SELECT 
    h.id,
    'Check Pool Chemicals',
    'Test and adjust pool chemical levels',
    NOW() + INTERVAL '1 week',
    r.id,
    FALSE
FROM houses h
CROSS JOIN recurrences r
WHERE h.name = 'Vacation Home'
AND r.name = 'Weekly'; 