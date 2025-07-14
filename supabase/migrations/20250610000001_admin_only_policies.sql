/*
  # Admin-Only Access Policies for Sensitive Tables

  This migration adds restrictive RLS policies for admin-only tables.
  Only the specific admin user (vikivahane@gmail.com) can access these tables.
*/

-- Admin-only access for orders table (for admin dashboard)
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;

-- Users can still view their own orders
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can still create their own orders
CREATE POLICY "Users can create their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only admin can update/delete orders
CREATE POLICY "Admin can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'vikivahane@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vikivahane@gmail.com');

-- Admin-only access for user_profiles table
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;

-- Users can still view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only admin can insert/delete user profiles
CREATE POLICY "Admin can manage all user profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'vikivahane@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vikivahane@gmail.com');

-- Admin-only access for order_tracking table
DROP POLICY IF EXISTS "Users can view their own order tracking" ON order_tracking;
DROP POLICY IF EXISTS "Users can create tracking for their own orders" ON order_tracking;

-- Users can still view their own order tracking
CREATE POLICY "Users can view their own order tracking"
  ON order_tracking
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_tracking.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Only admin can create/update/delete order tracking
CREATE POLICY "Admin can manage all order tracking"
  ON order_tracking
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'vikivahane@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vikivahane@gmail.com');

-- Admin-only access for notifications table
DROP POLICY IF EXISTS "Users can manage their own notifications" ON notifications;

-- Users can still view and update their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only admin can insert/delete notifications
CREATE POLICY "Admin can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'vikivahane@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vikivahane@gmail.com'); 