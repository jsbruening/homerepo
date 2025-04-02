-- Create enum types
CREATE TYPE service_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE service_recurrence AS ENUM ('one-time', 'monthly', 'quarterly', 'semi-annual', 'annual');
CREATE TYPE reminder_recurrence AS ENUM ('one-time', 'daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'annual');

-- Create houses table
CREATE TABLE houses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    owners TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    floor_level INTEGER,
    square_footage NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create paint_records table
CREATE TABLE paint_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    room VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    color_name VARCHAR(255) NOT NULL,
    color_code VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create home_services table
CREATE TABLE home_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    service_type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status service_status NOT NULL DEFAULT 'scheduled',
    recurrence service_recurrence NOT NULL DEFAULT 'one-time',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plants table
CREATE TABLE plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(255),
    location VARCHAR(255),
    water_frequency INTEGER,
    last_watered DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    due_date DATE NOT NULL,
    recurrence reminder_recurrence NOT NULL DEFAULT 'one-time',
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
-- Insert two houses
INSERT INTO houses (id, name, address, owners) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Main House', '123 Main St, Anytown, USA', ARRAY['John Doe', 'Jane Doe']),
    ('22222222-2222-2222-2222-222222222222', 'Beach House', '456 Ocean Ave, Beachtown, USA', ARRAY['John Doe']);

-- Insert paint records
INSERT INTO paint_records (house_id, room, manufacturer, color_name, color_code) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Living Room', 'Sherwin Williams', 'Sea Salt', 'SW 6204'),
    ('11111111-1111-1111-1111-111111111111', 'Kitchen', 'Benjamin Moore', 'Simply White', 'OC-117'),
    ('22222222-2222-2222-2222-222222222222', 'Master Bedroom', 'Behr', 'Ocean Dream', 'S470-4'),
    ('22222222-2222-2222-2222-222222222222', 'Bathroom', 'Sherwin Williams', 'Naval', 'SW 6244');

-- Insert home services
INSERT INTO home_services (house_id, service_type, provider, date, status, recurrence) VALUES
    ('11111111-1111-1111-1111-111111111111', 'HVAC Maintenance', 'ABC HVAC', '2024-05-15', 'scheduled', 'annual'),
    ('11111111-1111-1111-1111-111111111111', 'Lawn Care', 'Green Thumb', '2024-04-10', 'scheduled', 'monthly'),
    ('22222222-2222-2222-2222-222222222222', 'Pool Service', 'Blue Waters', '2024-04-05', 'scheduled', 'monthly'),
    ('22222222-2222-2222-2222-222222222222', 'Pest Control', 'Bug Busters', '2024-06-01', 'scheduled', 'quarterly');

-- Insert plants
INSERT INTO plants (house_id, name, species, location, water_frequency, last_watered) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Fiddle Leaf Fig', 'Ficus lyrata', 'Living Room', 7, '2024-04-01'),
    ('11111111-1111-1111-1111-111111111111', 'Snake Plant', 'Sansevieria', 'Bedroom', 14, '2024-03-30'),
    ('22222222-2222-2222-2222-222222222222', 'Bird of Paradise', 'Strelitzia', 'Sunroom', 5, '2024-04-02'),
    ('22222222-2222-2222-2222-222222222222', 'Peace Lily', 'Spathiphyllum', 'Bathroom', 7, '2024-04-01');

-- Insert reminders
INSERT INTO reminders (house_id, title, details, due_date, recurrence, completed) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Change Air Filters', 'Replace HVAC filters in all returns', '2024-04-15', 'monthly', false),
    ('11111111-1111-1111-1111-111111111111', 'Clean Gutters', 'Clean all gutters and check downspouts', '2024-05-01', 'quarterly', false),
    ('22222222-2222-2222-2222-222222222222', 'Check Pool Chemistry', 'Test and adjust pool chemical levels', '2024-04-07', 'weekly', false),
    ('22222222-2222-2222-2222-222222222222', 'Replace Water Filter', 'Replace whole-house water filter', '2024-06-01', 'semi-annual', false);

-- Create indexes for better performance
CREATE INDEX idx_paint_records_house_id ON paint_records(house_id);
CREATE INDEX idx_home_services_house_id ON home_services(house_id);
CREATE INDEX idx_plants_house_id ON plants(house_id);
CREATE INDEX idx_reminders_house_id ON reminders(house_id); 