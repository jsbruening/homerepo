-- Drop existing tables and types
DROP TABLE IF EXISTS paint_records CASCADE;
DROP TABLE IF EXISTS home_services CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS houses CASCADE;
DROP TABLE IF EXISTS paint_manufacturers CASCADE;
DROP TABLE IF EXISTS service_types CASCADE;
DROP TABLE IF EXISTS recurrences CASCADE;
DROP TYPE IF EXISTS service_status CASCADE;
DROP TYPE IF EXISTS service_recurrence CASCADE;
DROP TYPE IF EXISTS reminder_recurrence CASCADE;

-- Create enum types
CREATE TYPE service_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE service_recurrence AS ENUM ('one-time', 'monthly', 'quarterly', 'semi-annual', 'annual');
CREATE TYPE reminder_recurrence AS ENUM ('one-time', 'daily', 'weekly', 'monthly', 'quarterly', 'annual');

-- Create recurrences table
CREATE TABLE recurrences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create houses table
CREATE TABLE houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owners TEXT[] NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create paint_records table
CREATE TABLE paint_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id UUID REFERENCES paint_manufacturers(id),
  color_name TEXT NOT NULL,
  color_code TEXT NOT NULL,
  room_id UUID REFERENCES rooms(id),
  house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create home_services table
CREATE TABLE home_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type_id UUID REFERENCES service_types(id),
  provider TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status service_status NOT NULL DEFAULT 'scheduled',
  recurrence_id UUID REFERENCES recurrences(id),
  notes TEXT,
  house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plants table
CREATE TABLE plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('indoor', 'outdoor')),
  sun_requirements TEXT NOT NULL CHECK (sun_requirements IN ('no sun', 'partial shade', 'full sun')),
  max_height NUMERIC NOT NULL,
  max_width NUMERIC NOT NULL,
  notes TEXT,
  house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence_id UUID REFERENCES recurrences(id),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
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
$$ language 'plpgsql';

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
CREATE INDEX paint_records_house_id_idx ON paint_records(house_id);
CREATE INDEX home_services_house_id_idx ON home_services(house_id);
CREATE INDEX plants_house_id_idx ON plants(house_id);
CREATE INDEX reminders_house_id_idx ON reminders(house_id);

-- Insert recurrences
INSERT INTO recurrences (name, value, description) VALUES
  ('One-time', 'one-time', 'Occurs only once'),
  ('Daily', 'daily', 'Occurs every day'),
  ('Weekly', 'weekly', 'Occurs every week'),
  ('Monthly', 'monthly', 'Occurs every month'),
  ('Quarterly', 'quarterly', 'Occurs every three months'),
  ('Semi-annual', 'semi-annual', 'Occurs every six months'),
  ('Annual', 'annual', 'Occurs every year');

-- Insert test data for houses
INSERT INTO houses (name, owners, address) VALUES
  ('Main House', ARRAY['John Doe', 'Jane Doe'], '123 Main St, Anytown, USA'),
  ('Vacation Home', ARRAY['John Doe', 'Jane Doe'], '456 Beach Rd, Seaside, USA');

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

-- Insert common rooms
INSERT INTO rooms (name, description, floor_level, square_footage) VALUES
  -- First Floor
  ('Living Room', 'Main living area with fireplace', 1, 400),
  ('Kitchen', 'Open concept kitchen with island', 1, 300),
  ('Dining Room', 'Formal dining area', 1, 200),
  ('Family Room', 'Casual living space', 1, 350),
  ('Foyer', 'Entryway', 1, 100),
  ('Powder Room', 'Half bathroom', 1, 50),
  ('Garage', 'Two car garage', 1, 600),
  ('Mudroom', 'Entry from garage', 1, 80),
  
  -- Second Floor
  ('Master Bedroom', 'Primary bedroom with en suite', 2, 400),
  ('Master Bathroom', 'En suite bathroom', 2, 150),
  ('Bedroom 2', 'Guest bedroom', 2, 200),
  ('Bedroom 3', 'Children''s bedroom', 2, 200),
  ('Bedroom 4', 'Office/guest room', 2, 200),
  ('Bathroom 2', 'Shared bathroom', 2, 100),
  ('Bathroom 3', 'En suite bathroom', 2, 100),
  ('Laundry Room', 'Second floor laundry', 2, 100),
  
  -- Basement
  ('Basement', 'Finished basement', 0, 800),
  ('Storage Room', 'Unfinished storage area', 0, 400),
  ('Utility Room', 'HVAC and water heater', 0, 200),
  
  -- Outdoor
  ('Front Yard', 'Landscaped front area', 0, 2000),
  ('Back Yard', 'Landscaped backyard with patio', 0, 3000),
  ('Deck', 'Wooden deck', 1, 400),
  ('Patio', 'Concrete patio', 0, 300);

-- Insert test paint records
INSERT INTO paint_records (manufacturer_id, color_name, color_code, room_id, house_id)
SELECT 
  pm.id,
  'Simply White',
  'OC-117',
  r.id,
  h.id
FROM rooms r, houses h, paint_manufacturers pm
WHERE r.name = 'Living Room' AND h.name = 'Main House' AND pm.name = 'Benjamin Moore';

INSERT INTO paint_records (manufacturer_id, color_name, color_code, room_id, house_id)
SELECT 
  pm.id,
  'Agreeable Gray',
  'SW 7029',
  r.id,
  h.id
FROM rooms r, houses h, paint_manufacturers pm
WHERE r.name = 'Master Bedroom' AND h.name = 'Main House' AND pm.name = 'Sherwin-Williams';

-- Insert test paint records for Vacation Home
INSERT INTO paint_records (manufacturer_id, color_name, color_code, room_id, house_id)
SELECT 
  pm.id,
  'Beach Glass',
  'OC-123',
  r.id,
  h.id
FROM rooms r, houses h, paint_manufacturers pm
WHERE r.name = 'Living Room' AND h.name = 'Vacation Home' AND pm.name = 'Benjamin Moore';

INSERT INTO paint_records (manufacturer_id, color_name, color_code, room_id, house_id)
SELECT 
  pm.id,
  'Sea Salt',
  'SW 6204',
  r.id,
  h.id
FROM rooms r, houses h, paint_manufacturers pm
WHERE r.name = 'Master Bedroom' AND h.name = 'Vacation Home' AND pm.name = 'Sherwin-Williams';

-- Insert test home services
INSERT INTO home_services (service_type_id, provider, date, status, recurrence_id, notes, house_id)
SELECT 
  st.id,
  'Cool Air Co',
  NOW() + INTERVAL '1 month',
  'scheduled',
  r.id,
  'Regular maintenance check',
  h.id
FROM houses h, service_types st, recurrences r
WHERE h.name = 'Main House' AND st.name = 'HVAC Maintenance' AND r.name = 'Semi-annual';

-- Insert test home services for Vacation Home
INSERT INTO home_services (service_type_id, provider, date, status, recurrence_id, notes, house_id)
SELECT 
  st.id,
  'Beach Pool Service',
  NOW() + INTERVAL '2 weeks',
  'scheduled',
  r.id,
  'Regular pool cleaning and maintenance',
  h.id
FROM houses h, service_types st, recurrences r
WHERE h.name = 'Vacation Home' AND st.name = 'Pool Maintenance' AND r.name = 'Monthly';

INSERT INTO home_services (service_type_id, provider, date, status, recurrence_id, notes, house_id)
SELECT 
  st.id,
  'Coastal Landscaping',
  NOW() + INTERVAL '1 week',
  'scheduled',
  r.id,
  'Regular lawn maintenance and palm tree trimming',
  h.id
FROM houses h, service_types st, recurrences r
WHERE h.name = 'Vacation Home' AND st.name = 'Landscaping' AND r.name = 'Monthly';

-- Insert test plants
INSERT INTO plants (name, location, type, sun_requirements, max_height, max_width, notes, house_id)
SELECT 
  'Snake Plant',
  'Living Room',
  'indoor',
  'partial shade',
  3,
  1,
  'Low maintenance plant',
  id
FROM houses
WHERE name = 'Main House';

-- Insert test plants for Vacation Home
INSERT INTO plants (name, location, type, sun_requirements, max_height, max_width, notes, house_id)
SELECT 
  'Palm Tree',
  'Back Yard',
  'outdoor',
  'full sun',
  20,
  5,
  'Tropical palm tree',
  id
FROM houses
WHERE name = 'Vacation Home';

INSERT INTO plants (name, location, type, sun_requirements, max_height, max_width, notes, house_id)
SELECT 
  'Monstera',
  'Living Room',
  'indoor',
  'partial shade',
  6,
  3,
  'Tropical indoor plant',
  id
FROM houses
WHERE name = 'Vacation Home';

-- Insert test reminders
INSERT INTO reminders (title, details, due_date, recurrence_id, completed, house_id)
SELECT 
  'Replace Air Filter',
  'Replace HVAC air filter',
  NOW() + INTERVAL '3 months',
  r.id,
  false,
  id
FROM houses h, recurrences r
WHERE h.name = 'Main House' AND r.name = 'Quarterly';

-- Insert test reminders for Vacation Home
INSERT INTO reminders (title, details, due_date, recurrence_id, completed, house_id)
INSERT INTO reminders (title, details, due_date, recurrence_id, completed, house_id)
SELECT 
  'Check Storm Shutters',
  'Inspect and test storm shutters before hurricane season',
  NOW() + INTERVAL '1 month',
  r.id,
  false,
  id
FROM houses h, recurrences r
WHERE h.name = 'Vacation Home' AND r.name = 'Annual';

INSERT INTO reminders (title, details, due_date, recurrence_id, completed, house_id)
SELECT 
  'Clean Pool Filter',
  'Clean and inspect pool filter system',
  NOW() + INTERVAL '2 months',
  r.id,
  false,
  id
FROM houses h, recurrences r
WHERE h.name = 'Vacation Home' AND r.name = 'Quarterly'; 