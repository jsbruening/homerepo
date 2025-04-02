-- Drop the existing reminders table
DROP TABLE IF EXISTS reminders;

-- Create the reminders table with the correct structure
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  due_date DATE NOT NULL,
  recurrence_id UUID REFERENCES recurrences(id) ON DELETE SET NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  house_id UUID REFERENCES houses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on house_id for better query performance
CREATE INDEX reminders_house_id_idx ON reminders(house_id);

-- Create an index on recurrence_id for better query performance
CREATE INDEX reminders_recurrence_id_idx ON reminders(recurrence_id);

-- Create a trigger for updating the updated_at timestamp
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 