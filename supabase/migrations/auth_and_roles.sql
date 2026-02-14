-- Migration to add Auth relationship and Roles

-- 1. Add columns to barbers table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'barber');
  END IF;
END $$;

ALTER TABLE barbers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'barber';

-- 2. Enable RLS on all tables
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- 3. Security Definer functions to avoid policy recursion
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM barbers WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Policies for BARBERS table
DROP POLICY IF EXISTS "Public read access for barbers" ON barbers;
CREATE POLICY "Public read access for barbers" ON barbers
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can manage all barbers" ON barbers;
CREATE POLICY "Admins can manage all barbers" ON barbers
  FOR ALL TO authenticated USING (get_my_role() = 'admin');

DROP POLICY IF EXISTS "Barbers can update own profile" ON barbers;
CREATE POLICY "Barbers can update own profile" ON barbers
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 5. Policies for SERVICES table
DROP POLICY IF EXISTS "Public read access for services" ON services;
CREATE POLICY "Public read access for services" ON services
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can manage all services" ON services;
CREATE POLICY "Admins can manage all services" ON services
  FOR ALL TO authenticated USING (get_my_role() = 'admin');

-- 6. Policies for APPOINTMENTS table

-- Crucial: Hide sensitive PII (name, email, phone) from public select
-- We do this by allowing public to ONLY see columns needed for availability
REVOKE SELECT ON appointments FROM anon;
GRANT SELECT (id, barber_id, start_time, end_time, status) ON appointments TO anon;

DROP POLICY IF EXISTS "Public can view appointments for availability" ON appointments;
CREATE POLICY "Public can view appointments for availability" ON appointments
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
CREATE POLICY "Public can create appointments" ON appointments
  FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage all appointments" ON appointments;
CREATE POLICY "Admins can manage all appointments" ON appointments
  FOR ALL TO authenticated USING (get_my_role() = 'admin');

DROP POLICY IF EXISTS "Barbers can manage own appointments" ON appointments;
CREATE POLICY "Barbers can manage own appointments" ON appointments
  FOR ALL TO authenticated
  USING (
    barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid())
  );

-- 7. Update seed data (Optional/Example)
-- In a real scenario, you'd manually link existing auth.users to these barbers.
UPDATE barbers SET role = 'admin' WHERE name = 'Juan Pérez';
