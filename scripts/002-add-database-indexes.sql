-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_records_artist ON records(artist);
CREATE INDEX IF NOT EXISTS idx_records_album ON records(album);
CREATE INDEX IF NOT EXISTS idx_records_genre ON records(genre);
CREATE INDEX IF NOT EXISTS idx_records_year ON records(year);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at);

-- Add full-text search index for title and artist
CREATE INDEX IF NOT EXISTS idx_records_search ON records USING gin(to_tsvector('english', title || ' ' || artist));

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_records_artist_album ON records(artist, album);
