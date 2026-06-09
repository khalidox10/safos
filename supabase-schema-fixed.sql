-- SAFOS Complete Database Schema for Supabase
-- Run this ENTIRE script in Supabase SQL Editor
-- Compatible with PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ DROP EXISTING TABLES (if they exist) ============
-- Uncomment these lines if you want to start fresh:
-- DROP TABLE IF EXISTS store_settings CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS craft_steps CASCADE;
-- DROP TABLE IF EXISTS testimonials CASCADE;
-- DROP TABLE IF EXISTS collections CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;

-- ============ PRODUCTS TABLE ============
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2),
  image_url TEXT,
  color TEXT,
  tag TEXT,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============ COLLECTIONS TABLE ============
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  piece_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============ TESTIMONIALS TABLE ============
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============ CRAFT STEPS TABLE ============
CREATE TABLE IF NOT EXISTS craft_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  step_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============ ORDERS TABLE ============
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT,
  customer_address TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============ STORE SETTINGS TABLE ============
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_store_settings_key ON store_settings(key);

-- ============ ENABLE ROW LEVEL SECURITY (RLS) ============
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE craft_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- ============ PRODUCTS POLICIES ============
-- Drop existing policies if they exist, then recreate
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view products" ON products;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE TO authenticated USING (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE TO authenticated USING (true);

-- ============ COLLECTIONS POLICIES ============
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view collections" ON collections;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Public can view collections" ON collections
  FOR SELECT USING (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage collections" ON collections;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Authenticated users can manage collections" ON collections
  FOR ALL TO authenticated USING (true);

-- ============ TESTIMONIALS POLICIES ============
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view testimonials" ON testimonials;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Public can view testimonials" ON testimonials
  FOR SELECT USING (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage testimonials" ON testimonials;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Authenticated users can manage testimonials" ON testimonials
  FOR ALL TO authenticated USING (true);

-- ============ CRAFT STEPS POLICIES ============
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view craft steps" ON craft_steps;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Public can view craft steps" ON craft_steps
  FOR SELECT USING (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage craft steps" ON craft_steps;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Authenticated users can manage craft steps" ON craft_steps
  FOR ALL TO authenticated USING (true);

-- ============ ORDERS POLICIES ============
DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT TO authenticated USING (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Authenticated users can insert orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE TO authenticated USING (true);

-- ============ STORE SETTINGS POLICIES ============
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view store settings" ON store_settings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Public can view store settings" ON store_settings
  FOR SELECT USING (true);

DO $$ BEGIN
  DROP POLICY IF EXISTS "Authenticated users can manage store settings" ON store_settings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Authenticated users can manage store settings" ON store_settings
  FOR ALL TO authenticated USING (true);

-- ============ DEFAULT STORE SETTINGS ============
INSERT INTO store_settings (key, value) VALUES
  ('brand', '{"name": "SAFOS", "subtitle": "Embroidered Atelier", "logo_letter": "S"}'::jsonb),
  ('colors', '{"primary": "#1a1410", "secondary": "#b8935a", "accent": "#d4b483"}'::jsonb),
  ('contact', '{"phone": "+212 6 12 34 56 78", "email": "hello@safos.ma", "address": "Casablanca, Morocco", "instagram": "safos.bags", "facebook": "safos.bags"}'::jsonb),
  ('hero', '{"title": "غرزةٌ\\nتُطرَّز بيدٍ\\nوتُروى بحب", "subtitle": "مجموعة التطريز اليدوي 2026", "image": "/products/bag-beige-navy.jpg"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============ TRIGGERS ============
-- Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_store_settings_updated_at ON store_settings;
CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============ INSERT SAMPLE PRODUCTS ============
INSERT INTO products (name, name_en, price, old_price, image_url, color, tag, category, stock) VALUES
  ('حقيبة صفاء', 'Safaa Chevron', 850, 1000, '/products/bag-beige-navy.jpg', 'بيج × أزرق كحلي', 'الأكثر مبيعاً', 'chevron', 5),
  ('حقيبة لينا', 'Lina Monochrome', 720, null, '/products/bag-black-white.jpg', 'أسود × أبيض × بيج', 'جديد', 'clutch', 3),
  ('حقيبة فرحة', 'Farha Pastel', 950, 1150, '/products/bag-pastel.jpg', 'ألوان الباستيل', 'حصري', 'chain', 2),
  ('حقيبة مريم', 'Mariam Lavender', 880, null, '/products/bag-lavender.jpg', 'بنفسجي لافندر', 'محدود', 'chain', 4),
  ('حقيبة نجاة', 'Najat Red', 780, 900, '/products/bag-red-white.jpg', 'أحمر × أبيض', 'تخفيض', 'chevron', 6),
  ('حقيبة رجاء', 'Raja Sage', 820, null, '/products/bag-sage-pink.jpg', 'أخضر سيج × وردي', 'جديد', 'crossbody', 3),
  ('حقيبة بهيجة', 'Bahija Classic', 690, null, '/products/bag-beige-solid.jpg', 'بيج ذهبي', null, 'classic', 8)
ON CONFLICT DO NOTHING;

-- ============ VERIFICATION QUERIES ============
-- Run these to verify everything was created successfully:

-- Check tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check policies
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;

-- Check sample data
-- SELECT COUNT(*) FROM products;
-- SELECT COUNT(*) FROM store_settings;

-- ============ SETUP COMPLETE ============
-- Your Supabase database is now ready!
-- Next steps:
-- 1. Create storage buckets (product-images, logos, website-images)
-- 2. Create admin user in Authentication
-- 3. Access admin panel at /admin/login
