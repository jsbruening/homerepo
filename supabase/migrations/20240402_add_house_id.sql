-- Add house_id column to all tables
ALTER TABLE paint_records ADD COLUMN house_id UUID REFERENCES houses(id) ON DELETE CASCADE;
ALTER TABLE home_services ADD COLUMN house_id UUID REFERENCES houses(id) ON DELETE CASCADE;
ALTER TABLE plants ADD COLUMN house_id UUID REFERENCES houses(id) ON DELETE CASCADE;
ALTER TABLE reminders ADD COLUMN house_id UUID REFERENCES houses(id) ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX idx_paint_records_house_id ON paint_records(house_id);
CREATE INDEX idx_home_services_house_id ON home_services(house_id);
CREATE INDEX idx_plants_house_id ON plants(house_id);
CREATE INDEX idx_reminders_house_id ON reminders(house_id); 