-- Add missing columns to leads table if they don't exist
DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'type') THEN
    ALTER TABLE leads ADD COLUMN type TEXT DEFAULT 'lead';
  END IF;
END
$;

DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'serviceinterest') THEN
    ALTER TABLE leads ADD COLUMN serviceinterest TEXT;
  END IF;
END
$;

DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'createdat') THEN
    ALTER TABLE leads ADD COLUMN createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END
$;

DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'name') THEN
    ALTER TABLE leads ADD COLUMN name TEXT;
  END IF;
END
$;

DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'company') THEN
    ALTER TABLE leads ADD COLUMN company TEXT;
  END IF;
END
$;

-- Add missing columns to newsletter_subscriptions table if they don't exist
DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletter_subscriptions' AND column_name = 'type') THEN
    ALTER TABLE newsletter_subscriptions ADD COLUMN type TEXT DEFAULT 'newsletter';
  END IF;
END
$;

DO $ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletter_subscriptions' AND column_name = 'subscribedat') THEN
    ALTER TABLE newsletter_subscriptions ADD COLUMN subscribedat TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END
$;

DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletter_subscriptions' AND column_name = 'name') THEN
    ALTER TABLE newsletter_subscriptions ADD COLUMN name TEXT;
  END IF;
END
$;

DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'newsletter_subscriptions' AND column_name = 'company') THEN
    ALTER TABLE newsletter_subscriptions ADD COLUMN company TEXT;
  END IF;
END
$;

-- Enable Row Level Security if not enabled
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert leads' AND tablename = 'leads') THEN
    CREATE POLICY "Anyone can insert leads" ON leads FOR INSERT WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can read leads' AND tablename = 'leads') THEN
    CREATE POLICY "Admin can read leads" ON leads FOR SELECT USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can insert newsletter subscriptions' AND tablename = 'newsletter_subscriptions') THEN
    CREATE POLICY "Anyone can insert newsletter subscriptions" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read newsletter subscriptions' AND tablename = 'newsletter_subscriptions') THEN
    CREATE POLICY "Public can read newsletter subscriptions" ON newsletter_subscriptions FOR SELECT USING (true);
  END IF;
END
$$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_createdat ON leads(createdat);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_type ON newsletter_subscriptions(type);

-- Verify tables exist and show their structure
SELECT 'leads table:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leads';

SELECT 'newsletter_subscriptions table:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'newsletter_subscriptions';
