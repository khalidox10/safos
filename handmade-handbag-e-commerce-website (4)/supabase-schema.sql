-- SAFOS Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
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

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  piece_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Craft steps table
CREATE TABLE IF NOT EXISTS craft_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  step_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Orders table
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

-- Store settings table
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE craft_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Public can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE TO authenticated USING (true);

-- Collections policies
CREATE POLICY "Public can view collections" ON collections
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage collections" ON collections
  FOR ALL TO authenticated USING (true);

-- Testimonials policies
CREATE POLICY "Public can view testimonials" ON testimonials
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage testimonials" ON testimonials
  FOR ALL TO authenticated USING (true);

-- Craft steps policies
CREATE POLICY "Public can view craft steps" ON craft_steps
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage craft steps" ON craft_steps
  FOR ALL TO authenticated USING (true);

-- Orders policies
CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE TO authenticated USING (true);

-- Store settings policies
CREATE POLICY "Public can view store settings" ON store_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage store settings" ON store_settings
  FOR ALL TO authenticated USING (true);

-- Insert default store settings
INSERT INTO store_settings (key, value) VALUES
  ('brand', '{"name": "SAFOS", "subtitle": "Embroidered Atelier", "logo_letter": "S"}'::jsonb),
  ('colors', '{"primary": "#1a1410", "secondary": "#b8935a", "accent": "#d4b483"}'::jsonb),
  ('contact', '{"phone": "+212 6 12 34 56 78", "email": "hello@safos.ma", "address": "Casablanca, Morocco"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
