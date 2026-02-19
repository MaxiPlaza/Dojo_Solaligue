-- =============================================
-- Supabase Migration: Dojo Solaligue
-- Run this in the Supabase SQL Editor
-- =============================================

-- Plans
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  price REAL NOT NULL,
  description TEXT
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'coach', 'student')) NOT NULL DEFAULT 'student',
  plan_id INTEGER REFERENCES plans(id),
  subscription_end_date TIMESTAMPTZ,
  linked_maestro_id INTEGER REFERENCES users(id),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dojos
CREATE TABLE IF NOT EXISTS dojos (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  lat REAL,
  lng REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modalities
CREATE TABLE IF NOT EXISTS modalities (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT
);

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  dojo_id INTEGER NOT NULL REFERENCES dojos(id),
  modality_id INTEGER NOT NULL REFERENCES modalities(id),
  coach_id INTEGER REFERENCES users(id),
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL
);

-- Content (Educational Platform)
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK(type IN ('pdf', 'video', 'image', 'link', 'meeting')) NOT NULL,
  url TEXT NOT NULL,
  plan_min_level INTEGER NOT NULL DEFAULT 1,
  uploader_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentorship Notes
CREATE TABLE IF NOT EXISTS mentorship_notes (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id),
  student_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coach-Student Assignment
CREATE TABLE IF NOT EXISTS coach_students (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES users(id),
  student_id INTEGER NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coach_id, student_id)
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Seed Data
-- =============================================

INSERT INTO plans (id, name, price, description) VALUES 
(0, 'Gratuito', 0, 'Acceso inicial gratuito'),
(1, 'Novato', 8000, 'Acceso básico'),
(2, 'Luchador', 15000, 'Acceso intermedio + PDFs exclusivos'),
(3, 'Maestro', 30000, 'Acceso total + 2x1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO modalities (name, description) VALUES
('MMA', 'Artes Marciales Mixtas'),
('Boxeo', 'Entrenamiento de boxeo clásico'),
('Kickboxing', 'Combate de pie con puños y patadas'),
('Defensa Personal Urbana', 'Técnicas para situaciones reales'),
('Full Contact', 'Combate pleno de contacto'),
('K1', 'Reglas K1 de kickboxing'),
('Karate Okinawense Shorinji Kenpo', 'Arte marcial tradicional de Okinawa')
ON CONFLICT (name) DO NOTHING;

-- Reset the sequence for plans since we inserted id=0
SELECT setval('plans_id_seq', (SELECT MAX(id) FROM plans));
