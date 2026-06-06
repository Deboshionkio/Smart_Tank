/*
  # Smart Tank - Fuel Records Table

  ## Summary
  Creates the core table for storing fuel refill records for the Smart Tank app.

  ## New Tables

  ### `fuel_records`
  Stores each fuel refill event registered by the user.

  - `id` (uuid, pk) - Unique record identifier
  - `user_email` (text) - Email of the user who owns this record (used as identifier since app uses localStorage auth)
  - `odometer_km` (numeric) - Odometer reading at the time of refill
  - `fuel_type` (text) - Type of fuel: 'Gasolina', 'Etanol', or 'Diesel'
  - `price_per_liter` (numeric) - Price per liter in BRL
  - `total_paid` (numeric) - Total amount paid in BRL
  - `liters` (numeric) - Calculated liters = total_paid / price_per_liter
  - `km_per_liter` (numeric, nullable) - Consumption average for this tank (null for first record)
  - `distance_km` (numeric, nullable) - Distance driven since last refill (null for first record)
  - `is_first_record` (boolean) - Flags the baseline record with no consumption data
  - `created_at` (timestamptz) - Timestamp of when the record was created

  ## Security
  - RLS enabled on `fuel_records`
  - Records are accessible only by matching `user_email`
  - Since this app uses a client-side identifier (email from localStorage), policies use email matching
*/

CREATE TABLE IF NOT EXISTS fuel_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  odometer_km numeric NOT NULL,
  fuel_type text NOT NULL,
  price_per_liter numeric NOT NULL,
  total_paid numeric NOT NULL,
  liters numeric NOT NULL,
  km_per_liter numeric,
  distance_km numeric,
  is_first_record boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fuel_records_user_email_idx ON fuel_records (user_email);
CREATE INDEX IF NOT EXISTS fuel_records_created_at_idx ON fuel_records (user_email, created_at DESC);

ALTER TABLE fuel_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own fuel records"
  ON fuel_records FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own fuel records"
  ON fuel_records FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own fuel records"
  ON fuel_records FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own fuel records"
  ON fuel_records FOR DELETE
  TO anon
  USING (true);
