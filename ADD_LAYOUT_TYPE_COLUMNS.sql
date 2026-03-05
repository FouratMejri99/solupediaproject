-- Add layout_type and sub_items columns to service_layouts table

-- Add layout_type column (1, 2, 3, or 4)
ALTER TABLE service_layouts ADD COLUMN IF NOT EXISTS layout_type INTEGER DEFAULT 1;

-- Add sub_items column (JSON array for sub-items in layouts 3 and 4)
ALTER TABLE service_layouts ADD COLUMN IF NOT EXISTS sub_items JSONB DEFAULT '[]'::jsonb;

-- Add iconized column for layout 4 (boolean to show if items should be iconized)
ALTER TABLE service_layouts ADD COLUMN IF NOT EXISTS iconized BOOLEAN DEFAULT false;

-- Create index for layout_type
CREATE INDEX IF NOT EXISTS idx_service_layouts_type ON service_layouts(layout_type);
