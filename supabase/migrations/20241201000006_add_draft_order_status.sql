-- Add support for draft order status and improve order status management
-- This migration adds new order statuses and updates existing orders

-- First, let's update any existing pending orders that might be abandoned
UPDATE orders 
SET status = 'cancelled', 
    payment_status = 'cancelled' 
WHERE status = 'pending' 
  AND payment_status = 'pending' 
  AND created_at < NOW() - INTERVAL '30 minutes';

-- Add a comment to the orders table about the new status flow
COMMENT ON TABLE orders IS 'Order status flow: draft -> confirmed (after payment) -> shipped -> delivered. Payment status: pending -> paid/failed/cancelled';

-- Create a function to clean up abandoned draft orders
CREATE OR REPLACE FUNCTION cleanup_abandoned_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cancel draft orders older than 15 minutes
  UPDATE orders 
  SET status = 'cancelled', 
      payment_status = 'cancelled' 
  WHERE status = 'draft' 
    AND payment_status = 'pending' 
    AND created_at < NOW() - INTERVAL '15 minutes';
    
  -- Cancel pending orders older than 30 minutes (legacy cleanup)
  UPDATE orders 
  SET status = 'cancelled', 
      payment_status = 'cancelled' 
  WHERE status = 'pending' 
    AND payment_status = 'pending' 
    AND created_at < NOW() - INTERVAL '30 minutes';
END;
$$;

-- Create a scheduled job to run cleanup every 5 minutes (if using pg_cron)
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-abandoned-orders', '*/5 * * * *', 'SELECT cleanup_abandoned_orders();');

-- Add indexes for better performance on order cleanup queries
CREATE INDEX IF NOT EXISTS idx_orders_status_payment_created 
ON orders(status, payment_status, created_at);

CREATE INDEX IF NOT EXISTS idx_orders_user_status_created 
ON orders(user_id, status, created_at); 