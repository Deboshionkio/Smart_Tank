/*
  # Add vehicle_id column to fuel_records

  ## Summary
  Adds a `vehicle_id` column to the `fuel_records` table to support multiple vehicles per user.
  This allows users to register up to 3 vehicles and track fuel consumption independently per vehicle.

  ## Changes
  - Added `vehicle_id` (text, NOT NULL, default 'v1') to fuel_records
  - Added index on (user_email, vehicle_id) for efficient per-vehicle queries

  ## Security
  - No changes to existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'fuel_records' AND column_name = 'vehicle_id'
  ) THEN
    ALTER TABLE fuel_records ADD COLUMN vehicle_id text NOT NULL DEFAULT 'v1';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS fuel_records_vehicle_idx ON fuel_records (user_email, vehicle_id);
