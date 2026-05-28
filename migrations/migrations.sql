-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(150) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  image_url TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add an admin user sample (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@uot.ac.zm', '$2b$10$5urV5cOBw8s6Rb1T5JcIreG/qsXjBlI7oiPIvvyVlGMa3XqT0Kzci', 'admin')
ON CONFLICT (email) DO NOTHING;
