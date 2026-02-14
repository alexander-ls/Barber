-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Barbers table
CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES barbers(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint to prevent double-booking for the same barber
  CONSTRAINT no_double_booking EXCLUDE USING gist (
    barber_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
);

-- Realtime configuration
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE appointments;
COMMIT;

-- Seed data
INSERT INTO barbers (name, bio) VALUES
('Juan Pérez', 'Experto en cortes clásicos y degradados.'),
('Carlos Rodríguez', 'Especialista en cuidado de barba y estilo moderno.');

INSERT INTO services (name, description, duration_minutes, price) VALUES
('Corte de Cabello', 'Corte clásico o moderno con terminación a navaja.', 30, 15.00),
('Recorte de Barba', 'Perfilado y rebajado de barba con toalla caliente.', 20, 10.00),
('Combo Imperial', 'Corte de cabello + Barba completa.', 50, 22.00),
('Bloqueo de Horario', 'Uso interno para bloquear turnos.', 30, 0.00);
