-- Add keyfeatures and process columns to services table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE services ADD COLUMN IF NOT EXISTS keyfeatures TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS processsteps TEXT;

-- Optional: Add index for better query performance
-- CREATE INDEX IF NOT EXISTS idx_services_keyfeatures ON services(keyfeatures);
-- CREATE INDEX IF NOT EXISTS idx_services_processsteps ON services(processsteps);
