-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'coach', 'student')) NOT NULL DEFAULT 'student',
  plan_id INTEGER,
  subscription_end_date DATETIME,
  linked_maestro_id INTEGER,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  FOREIGN KEY (linked_maestro_id) REFERENCES users(id)
);

-- Plans
CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL, -- Novato, Luchador, Maestro
  price REAL NOT NULL,
  description TEXT
);

-- Dojos
CREATE TABLE IF NOT EXISTS dojos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  lat REAL,
  lng REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Modalities
CREATE TABLE IF NOT EXISTS modalities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT
);

-- Schedules (Horarios)
CREATE TABLE IF NOT EXISTS schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dojo_id INTEGER NOT NULL,
  modality_id INTEGER NOT NULL,
  coach_id INTEGER, -- Optional, specific coach for this time
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  FOREIGN KEY (dojo_id) REFERENCES dojos(id),
  FOREIGN KEY (modality_id) REFERENCES modalities(id),
  FOREIGN KEY (coach_id) REFERENCES users(id)
);

-- Content (Educational Platform)
CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK(type IN ('pdf', 'video', 'image', 'link', 'meeting')) NOT NULL,
  url TEXT NOT NULL,
  plan_min_level INTEGER NOT NULL DEFAULT 1, -- 1=Novato, 2=Luchador, 3=Maestro
  uploader_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploader_id) REFERENCES users(id)
);

-- Mentorship (Coach <-> Student tasks/messages)
CREATE TABLE IF NOT EXISTS mentorship_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coach_id INTEGER NOT NULL,
  student_id INTEGER, -- If NULL, it's a broadcast message to all students of this coach
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coach_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Coach-Student Assignment
CREATE TABLE IF NOT EXISTS coach_students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coach_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(coach_id, student_id),
  FOREIGN KEY (coach_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default Data
INSERT OR IGNORE INTO plans (id, name, price, description) VALUES 
(0, 'Gratuito', 0, 'Acceso inicial gratuito'),
(1, 'Novato', 8000, 'Acceso básico'),
(2, 'Luchador', 15000, 'Acceso intermedio + PDFs exclusivos'),
(3, 'Maestro', 30000, 'Acceso total + 2x1');

INSERT OR IGNORE INTO modalities (name, description) VALUES
('MMA', 'Artes Marciales Mixtas'),
('Boxeo', 'Entrenamiento de boxeo clásico'),
('Kickboxing', 'Combate de pie con puños y patadas'),
('Defensa Personal Urbana', 'Técnicas para situaciones reales'),
('Full Contact', 'Combate pleno de contacto'),
('K1', 'Reglas K1 de kickboxing'),
('Karate Okinawense Shorinji Kenpo', 'Arte marcial tradicional de Okinawa');
