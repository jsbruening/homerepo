-- Create paint_records table
CREATE TABLE paint_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  house_id UUID NOT NULL REFERENCES houses(id),
  manufacturer_id UUID NOT NULL REFERENCES paint_manufacturers(id),
  room_id UUID NOT NULL REFERENCES rooms(id),
  color TEXT NOT NULL,
  finish_type TEXT NOT NULL CHECK (finish_type IN ('flat', 'eggshell', 'satin', 'semi-gloss', 'gloss')),
  paint_type TEXT NOT NULL CHECK (paint_type IN ('interior', 'exterior', 'trim')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for paint_records
ALTER TABLE paint_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own paint records"
  ON paint_records FOR SELECT
  USING (
    house_id IN (
      SELECT id FROM houses
      WHERE owners @> ARRAY[auth.uid()::text]
    )
  );

CREATE POLICY "Users can insert their own paint records"
  ON paint_records FOR INSERT
  WITH CHECK (
    house_id IN (
      SELECT id FROM houses
      WHERE owners @> ARRAY[auth.uid()::text]
    )
  );

CREATE POLICY "Users can update their own paint records"
  ON paint_records FOR UPDATE
  USING (
    house_id IN (
      SELECT id FROM houses
      WHERE owners @> ARRAY[auth.uid()::text]
    )
  )
  WITH CHECK (
    house_id IN (
      SELECT id FROM houses
      WHERE owners @> ARRAY[auth.uid()::text]
    )
  );

CREATE POLICY "Users can delete their own paint records"
  ON paint_records FOR DELETE
  USING (
    house_id IN (
      SELECT id FROM houses
      WHERE owners @> ARRAY[auth.uid()::text]
    )
  ); 