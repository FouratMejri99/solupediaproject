-- Service Layouts Table
-- This table stores layout sections for each service

CREATE TABLE IF NOT EXISTS service_layouts (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  section_title TEXT,
  item_number INTEGER DEFAULT 1,
  item_icon TEXT,
  item_title TEXT NOT NULL,
  item_description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_service_layouts_service_id ON service_layouts(service_id);
CREATE INDEX IF NOT EXISTS idx_service_layouts_order ON service_layouts(order_index);

-- Enable Row Level Security
ALTER TABLE service_layouts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "service_layouts_public_read" ON service_layouts
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "service_layouts_auth_insert" ON service_layouts
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "service_layouts_auth_update" ON service_layouts
  FOR UPDATE USING (true);
  
CREATE POLICY "service_layouts_auth_delete" ON service_layouts
  FOR DELETE USING (true);
