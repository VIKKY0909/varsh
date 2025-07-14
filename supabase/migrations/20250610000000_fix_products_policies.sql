/*
  # Fix Products Table RLS Policies - Admin Only Access

  This migration ensures proper RLS policies are in place for the products table.
  Only the specific admin user can manage products, while public can read for browsing.
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

-- Recreate policies with proper permissions
-- Allow public read access to products (for browsing)
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Allow ONLY the admin user to insert/update/delete products
CREATE POLICY "Admin can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'vikivahane@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vikivahane@gmail.com');

-- Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Verify the policies are working by testing with a simple query
-- This will help identify if there are any remaining issues 