-- 1. Create the item categories table
CREATE TABLE IF NOT EXISTS item_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  base_price numeric(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Insert the initial categories and prices
-- We use ON CONFLICT to avoid errors if this script is run multiple times
INSERT INTO item_categories (name, base_price) VALUES
  ('Shirts', 500.00),
  ('Trousers', 300.00),
  ('Underwear', 200.00),
  ('Blankets and Duveys', 700.00),
  ('Caps', 300.00)
ON CONFLICT (name) DO UPDATE 
SET base_price = EXCLUDED.base_price,
    updated_at = NOW();

-- 3. Enable Row Level Security (RLS)
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;

-- 4. Drop any existing policies before recreating them to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON item_categories;
DROP POLICY IF EXISTS "public_read_item_categories" ON item_categories;
DROP POLICY IF EXISTS "staff_admin_all_item_categories" ON item_categories;

-- 5. Create new structured policies that match the existing app logic
-- Anyone can read the categories
CREATE POLICY "public_read_item_categories" 
ON item_categories
FOR SELECT USING (true);

-- Only staff and admins can modify categories (insert/update/delete)
-- This uses the existing public.is_staff_or_admin() security definer function verified from other scripts.
CREATE POLICY "staff_admin_all_item_categories" 
ON item_categories
FOR ALL USING (public.is_staff_or_admin());

-- Create index for faster sorting/lookup
CREATE INDEX IF NOT EXISTS idx_item_categories_name ON item_categories(name);
