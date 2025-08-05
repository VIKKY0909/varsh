-- Fix order update policies to allow users to update their own orders for payment status changes
-- This allows users to update their orders after payment while still restricting admin operations

-- Drop the existing admin-only policy for orders
DROP POLICY IF EXISTS "Admin can manage all orders" ON orders;

-- Create a more specific policy that allows users to update their own orders
-- but only for specific fields related to payment and status
CREATE POLICY "Users can update their own orders for payment"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND (
      -- Allow updates to payment-related fields
      (OLD.payment_status = 'pending' AND NEW.payment_status IN ('paid', 'failed', 'cancelled')) OR
      (OLD.status = 'pending' AND NEW.status IN ('confirmed', 'cancelled')) OR
      -- Allow setting razorpay_payment_id when payment is successful
      (NEW.razorpay_payment_id IS NOT NULL AND OLD.razorpay_payment_id IS NULL)
    )
  );

-- Create admin policy for all other operations
CREATE POLICY "Admin can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'vikivahane@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vikivahane@gmail.com');

-- Also fix order_tracking policies to allow users to create tracking for their own orders
DROP POLICY IF EXISTS "Admin can manage all order tracking" ON order_tracking;

-- Allow users to create tracking entries for their own orders
CREATE POLICY "Users can create tracking for their own orders"
  ON order_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_tracking.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Admin policy for all other order_tracking operations
CREATE POLICY "Admin can manage all order tracking"
  ON order_tracking
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'vikivahane@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vikivahane@gmail.com');

-- Fix notifications policies to allow users to create notifications for themselves
DROP POLICY IF EXISTS "Admin can manage all notifications" ON notifications;

-- Allow users to create notifications for themselves
CREATE POLICY "Users can create their own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admin policy for all other notification operations
CREATE POLICY "Admin can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'vikivahane@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vikivahane@gmail.com'); 