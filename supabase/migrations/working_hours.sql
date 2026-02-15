-- Working Hours table
CREATE TABLE IF NOT EXISTS working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(barber_id, day_of_week)
);

-- Enable RLS
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public can view working hours" ON working_hours;
CREATE POLICY "Public can view working hours" ON working_hours
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins can manage all working hours" ON working_hours;
CREATE POLICY "Admins can manage all working hours" ON working_hours
  FOR ALL TO authenticated USING (
    (SELECT role FROM barbers WHERE user_id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Barbers can manage own working hours" ON working_hours;
CREATE POLICY "Barbers can manage own working hours" ON working_hours
  FOR ALL TO authenticated
  USING (
    barber_id IN (SELECT id FROM barbers WHERE user_id = auth.uid())
  );
