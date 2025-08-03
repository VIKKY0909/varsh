/*
  # Add Payment Tracking for Razorpay Integration
  
  This migration adds payment tracking fields to the orders table
  to support Razorpay payment gateway integration.
*/

-- Add payment tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id text,
ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_processed_at timestamptz,
ADD COLUMN IF NOT EXISTS payment_failure_reason text;

-- Add indexes for payment tracking
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON public.orders(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);

-- Add comments for documentation
COMMENT ON COLUMN public.orders.razorpay_order_id IS 'Razorpay order ID for payment tracking';
COMMENT ON COLUMN public.orders.razorpay_payment_id IS 'Razorpay payment ID after successful payment';
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used (card, upi, netbanking, wallet)';
COMMENT ON COLUMN public.orders.payment_processed_at IS 'Timestamp when payment was processed';
COMMENT ON COLUMN public.orders.payment_failure_reason IS 'Reason for payment failure if applicable';

-- Create a function to update payment status
CREATE OR REPLACE FUNCTION update_order_payment_status(
  order_uuid uuid,
  razorpay_order_id_param text,
  razorpay_payment_id_param text,
  payment_method_param text,
  payment_status_param text
)
RETURNS void AS $$
BEGIN
  UPDATE public.orders 
  SET 
    razorpay_order_id = razorpay_order_id_param,
    razorpay_payment_id = razorpay_payment_id_param,
    payment_method = payment_method_param,
    payment_status = payment_status_param,
    payment_processed_at = CASE 
      WHEN payment_status_param = 'paid' THEN now()
      ELSE payment_processed_at
    END,
    updated_at = now()
  WHERE id = order_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_order_payment_status(uuid, text, text, text, text) TO authenticated;

-- Create a view for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
  DATE(created_at) as order_date,
  payment_method,
  payment_status,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue
FROM public.orders
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), payment_method, payment_status
ORDER BY order_date DESC, payment_method;

-- Grant select permission on the view
GRANT SELECT ON payment_analytics TO authenticated; 