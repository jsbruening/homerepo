-- Drop all existing tables in correct order
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS paint_records CASCADE;
DROP TABLE IF EXISTS home_services CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS paint_manufacturers CASCADE;
DROP TABLE IF EXISTS service_types CASCADE;
DROP TABLE IF EXISTS recurrences CASCADE;
DROP TABLE IF EXISTS houses CASCADE;

-- Create houses table
CREATE TABLE houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create paint_manufacturers table
CREATE TABLE paint_manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create paint_records table
CREATE TABLE paint_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    manufacturer_id UUID NOT NULL REFERENCES paint_manufacturers(id) ON DELETE CASCADE,
    color_name VARCHAR(255) NOT NULL,
    color_code VARCHAR(50) NOT NULL,
    paint_type VARCHAR(50) NOT NULL CHECK (paint_type IN ('interior', 'exterior')),
    finish_type VARCHAR(50) NOT NULL CHECK (finish_type IN ('flat', 'eggshell', 'satin', 'semi-gloss', 'gloss')),
    painted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create service_types table
CREATE TABLE service_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create recurrences table
CREATE TABLE recurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create home_services table
CREATE TABLE home_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    service_type_id UUID NOT NULL REFERENCES service_types(id) ON DELETE CASCADE,
    recurrence_id UUID NOT NULL REFERENCES recurrences(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    last_performed_at TIMESTAMP WITH TIME ZONE,
    next_due_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    recurrence_id UUID REFERENCES recurrences(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_houses_updated_at
    BEFORE UPDATE ON houses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paint_manufacturers_updated_at
    BEFORE UPDATE ON paint_manufacturers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paint_records_updated_at
    BEFORE UPDATE ON paint_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_types_updated_at
    BEFORE UPDATE ON service_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurrences_updated_at
    BEFORE UPDATE ON recurrences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_home_services_updated_at
    BEFORE UPDATE ON home_services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
    BEFORE UPDATE ON reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plants_updated_at
    BEFORE UPDATE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert reference data
INSERT INTO paint_manufacturers (name) VALUES
    ('Sherwin-Williams'),
    ('Benjamin Moore'),
    ('Behr'),
    ('Valspar'),
    ('PPG');

INSERT INTO service_types (name, description) VALUES
    ('HVAC Maintenance', 'Regular maintenance of heating, ventilation, and air conditioning systems'),
    ('Plumbing', 'Plumbing repairs and maintenance'),
    ('Electrical', 'Electrical system maintenance and repairs'),
    ('Landscaping', 'Garden and yard maintenance'),
    ('Cleaning', 'House cleaning services');

INSERT INTO recurrences (name, description) VALUES
    ('Monthly', 'Occurs every month'),
    ('Quarterly', 'Occurs every three months'),
    ('Semi-Annual', 'Occurs every six months'),
    ('Annual', 'Occurs once per year'),
    ('Bi-Annual', 'Occurs every two years');

-- Insert sample data
INSERT INTO houses (name, address) VALUES
    ('Main House', '123 Main Street, Anytown, USA'),
    ('Vacation Home', '456 Beach Road, Seaside, USA');

-- Insert rooms for the main house
INSERT INTO rooms (house_id, name)
SELECT h.id, rn.name
FROM houses h
CROSS JOIN (VALUES
    ('Living Room'),
    ('Kitchen'),
    ('Master Bedroom'),
    ('Guest Bedroom'),
    ('Bathroom'),
    ('Office')
) AS rn(name)
WHERE h.name = 'Main House';

-- Insert paint records
INSERT INTO paint_records (house_id, room_id, manufacturer_id, color_name, color_code, paint_type, finish_type, painted_at, notes)
SELECT 
    h.id,
    r.id,
    pm.id,
    'Cloud White',
    'OC-130',
    'interior',
    'eggshell',
    CURRENT_TIMESTAMP - INTERVAL '1 year',
    'Living room repaint'
FROM houses h
JOIN rooms r ON r.house_id = h.id
JOIN paint_manufacturers pm ON pm.name = 'Benjamin Moore'
WHERE h.name = 'Main House' AND r.name = 'Living Room';

-- Insert home services
INSERT INTO home_services (house_id, service_type_id, recurrence_id, name, description, last_performed_at, next_due_at)
SELECT 
    h.id,
    st.id,
    r.id,
    'Annual HVAC Maintenance',
    'Full system inspection and cleaning',
    CURRENT_TIMESTAMP - INTERVAL '6 months',
    CURRENT_TIMESTAMP + INTERVAL '6 months'
FROM houses h
JOIN service_types st ON st.name = 'HVAC Maintenance'
JOIN recurrences r ON r.name = 'Annual'
WHERE h.name = 'Main House';

-- Insert reminders
INSERT INTO reminders (house_id, title, description, due_date, recurrence_id)
SELECT 
    h.id,
    'Change HVAC Filter',
    'Replace the HVAC filter with a new one',
    CURRENT_TIMESTAMP + INTERVAL '1 month',
    r.id
FROM houses h
JOIN recurrences r ON r.name = 'Monthly'
WHERE h.name = 'Main House';

-- Insert plants
INSERT INTO plants (house_id, name, type, location, max_height, max_width, sun_requirements)
SELECT 
    h.id,
    'Monstera Deliciosa',
    'indoor',
    'Living Room',
    200,
    150,
    'partial'
FROM houses h
WHERE h.name = 'Main House'; 