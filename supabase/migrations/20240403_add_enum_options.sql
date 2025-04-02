-- Create enum types
CREATE TYPE plant_type AS ENUM ('indoor', 'outdoor');
CREATE TYPE sun_requirement AS ENUM ('no sun', 'partial shade', 'full sun');
CREATE TYPE service_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- Add enum columns to existing tables
ALTER TABLE plants 
  ALTER COLUMN type TYPE plant_type USING type::plant_type,
  ALTER COLUMN sun_requirements TYPE sun_requirement USING sun_requirements::sun_requirement,
  ADD COLUMN IF NOT EXISTS last_watered TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS next_watering TIMESTAMP WITH TIME ZONE;

ALTER TABLE home_services 
  ALTER COLUMN status TYPE service_status USING status::service_status;

-- Insert default values for existing records
UPDATE plants SET type = 'indoor'::plant_type WHERE type IS NULL;
UPDATE plants SET sun_requirements = 'partial shade'::sun_requirement WHERE sun_requirements IS NULL;
UPDATE home_services SET status = 'scheduled'::service_status WHERE status IS NULL; 