-- First drop tables with foreign key dependencies
DROP TABLE IF EXISTS paint_records CASCADE;
DROP TABLE IF EXISTS home_services CASCADE;
DROP TABLE IF EXISTS plants CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;

-- Then drop the parent tables
DROP TABLE IF EXISTS houses CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;

-- Drop any remaining types/enums if they exist
DROP TYPE IF EXISTS service_status CASCADE;
DROP TYPE IF EXISTS service_recurrence CASCADE;
DROP TYPE IF EXISTS reminder_recurrence CASCADE;

-- Drop any indexes (though they would be dropped with their tables)
DROP INDEX IF EXISTS idx_paint_records_house_id;
DROP INDEX IF EXISTS idx_home_services_house_id;
DROP INDEX IF EXISTS idx_plants_house_id;
DROP INDEX IF EXISTS idx_reminders_house_id; 