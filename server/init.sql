-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asthma logs table
CREATE TABLE IF NOT EXISTS asthma_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  complaints_text TEXT,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
  aqi_value INTEGER,
  temperature DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  aqi_category VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_asthma_logs_user_id ON asthma_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_asthma_logs_created_at ON asthma_logs(created_at);
