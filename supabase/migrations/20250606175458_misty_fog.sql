/*
  # Create products table for kurti e-commerce

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `description` (text, product description)
      - `price` (numeric, current price)
      - `original_price` (numeric, original price for discount calculation)
      - `category` (text, kurti category like casual, formal, party, festive)
      - `size` (text array, available sizes)
      - `color` (text, primary color)
      - `material` (text, fabric material)
      - `care_instructions` (text, care instructions)
      - `images` (text array, product image URLs)
      - `stock_quantity` (integer, available stock)
      - `is_featured` (boolean, featured product flag)
      - `is_new` (boolean, new arrival flag)
      - `is_bestseller` (boolean, bestseller flag)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access
    - Add policy for authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  original_price numeric NOT NULL CHECK (original_price > 0),
  category text NOT NULL CHECK (category IN ('casual', 'formal', 'party', 'festive')),
  size text[] NOT NULL DEFAULT '{}',
  color text NOT NULL,
  material text NOT NULL,
  care_instructions text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert/update products (for admin functionality)
CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);