-- Create paint_records table
CREATE TABLE IF NOT EXISTS paint_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color_code TEXT NOT NULL,
  room TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create home_services table
CREATE TABLE IF NOT EXISTS home_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  recurrence TEXT NOT NULL CHECK (recurrence IN ('one-time', 'monthly', 'quarterly', 'semi-annual', 'annual')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plants table
CREATE TABLE IF NOT EXISTS plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('indoor', 'outdoor')),
  sun_requirements TEXT NOT NULL CHECK (sun_requirements IN ('no sun', 'partial shade', 'full sun')),
  max_height NUMERIC NOT NULL,
  max_width NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence TEXT NOT NULL CHECK (recurrence IN ('one-time', 'daily', 'weekly', 'monthly', 'quarterly', 'annual')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger functions to update the updated_at field
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers for each table
CREATE TRIGGER update_paint_records_modified
BEFORE UPDATE ON paint_records
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_home_services_modified
BEFORE UPDATE ON home_services
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_plants_modified
BEFORE UPDATE ON plants
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_reminders_modified
BEFORE UPDATE ON reminders
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 