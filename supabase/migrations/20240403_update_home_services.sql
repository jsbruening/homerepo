-- Drop the existing home_services table
DROP TABLE IF EXISTS home_services;

-- Create the home_services table with the correct structure
CREATE TABLE home_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_type_id UUID REFERENCES service_types(id),
  provider TEXT NOT NULL,
  date DATE NOT NULL,
  status service_status NOT NULL DEFAULT 'scheduled',
  recurrence_id UUID REFERENCES recurrences(id),
  notes TEXT,
  house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX home_services_house_id_idx ON home_services(house_id);
CREATE INDEX home_services_service_type_id_idx ON home_services(service_type_id);
CREATE INDEX home_services_recurrence_id_idx ON home_services(recurrence_id);

-- Create a trigger for updating the updated_at timestamp
CREATE TRIGGER update_home_services_updated_at
  BEFORE UPDATE ON home_services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO home_services (service_type_id, provider, date, status, recurrence_id, notes, house_id)
SELECT 
  st.id,
  'Local HVAC Company',
  CURRENT_DATE + INTERVAL '1 month',
  'scheduled',
  r.id,
  'Regular maintenance check',
  h.id
FROM houses h
CROSS JOIN service_types st
CROSS JOIN recurrences r
WHERE h.name = 'Main House'
AND st.name = 'HVAC Maintenance'
AND r.name = 'Quarterly'; 