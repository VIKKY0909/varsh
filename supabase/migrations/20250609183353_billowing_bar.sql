/*
  # Add INSERT policy for order tracking

  1. Security Changes
    - Add policy to allow authenticated users to insert order tracking records
    - Policy ensures users can only create tracking entries for their own orders
    - Uses EXISTS check to verify order ownership through orders.user_id

  This fixes the RLS violation error when placing orders and creating initial tracking entries.
*/

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