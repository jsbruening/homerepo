-- Make location column nullable for outdoor plants
ALTER TABLE plants ALTER COLUMN location DROP NOT NULL; 