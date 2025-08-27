-- Create records table for vinyl collection
CREATE TABLE IF NOT EXISTS records (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  year INTEGER,
  genre VARCHAR(100),
  label VARCHAR(100),
  catalog_number VARCHAR(50),
  condition VARCHAR(20) DEFAULT 'Good',
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_records_artist ON records(artist);
CREATE INDEX IF NOT EXISTS idx_records_title ON records(title);
CREATE INDEX IF NOT EXISTS idx_records_genre ON records(genre);
