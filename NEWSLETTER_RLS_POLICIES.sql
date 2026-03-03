-- Enable Row Level Security on newsletter table
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can insert to newsletter" 
ON newsletter FOR INSERT WITH CHECK (true);

-- Allow public read access for newsletter (needed for admin page)
CREATE POLICY "Public can read newsletter" 
ON newsletter FOR SELECT USING (true);

-- Allow admin to delete subscriptions
CREATE POLICY "Admin can delete newsletter" 
ON newsletter FOR DELETE USING (true);
