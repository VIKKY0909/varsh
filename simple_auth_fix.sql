-- Simple Authentication Fix
-- This targets the most common causes of "Database error granting user"

-- 1. REMOVE ALL PROBLEMATIC FUNCTIONS IMMEDIATELY
DROP FUNCTION IF EXISTS get_user_emails_for_admin(uuid[]);
DROP FUNCTION IF EXISTS get_user_emails(uuid[]);
DROP FUNCTION IF EXISTS get_admin_user_data(uuid[]);
DROP FUNCTION IF EXISTS sync_user_email();
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS update_user_profile();

-- 2. DROP ALL COMPLEX POLICIES
-- User profiles - keep it simple
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admin can manage all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;

-- Products - keep it simple
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;
DROP POLICY IF EXISTS "Users can view products" ON products;

-- Orders - keep it simple
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Admin can manage all orders" ON orders;
DROP POLICY IF EXISTS "Users can manage their own orders" ON orders;

-- 3. CREATE MINIMAL WORKING POLICIES

-- User profiles: Basic policies only
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Products: Public read, admin manage
CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'vikivahane@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vikivahane@gmail.com');

-- Orders: Users manage their own, admin manages all
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'vikivahane@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vikivahane@gmail.com');

-- 4. ENABLE RLS ON ESSENTIAL TABLES ONLY
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. GRANT BASIC PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;

-- 6. CREATE SIMPLE STOCK FUNCTION
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id uuid, quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products 
  SET stock_quantity = stock_quantity - quantity
  WHERE id = product_id AND stock_quantity >= quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or insufficient stock';
  END IF;
END;
$$;

-- 7. VERIFICATION
SELECT 'Simple auth fix completed' as status;

-- Test basic access
SELECT 
  'User profiles accessible' as test,
  EXISTS (SELECT 1 FROM user_profiles LIMIT 1) as result;

SELECT 
  'Products accessible' as test,
  EXISTS (SELECT 1 FROM products LIMIT 1) as result;

SELECT 
  'Orders accessible' as test,
  EXISTS (SELECT 1 FROM orders LIMIT 1) as result; 