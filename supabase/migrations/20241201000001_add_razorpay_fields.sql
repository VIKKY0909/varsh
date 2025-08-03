-- Add Razorpay payment tracking fields to orders table
-- This migration adds fields to track Razorpay order and payment IDs

-- Add Razorpay fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id text,
ADD COLUMN IF NOT EXISTS razorpay_payment_id text;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON public.orders(razorpay_payment_id);

-- Add comments for documentation
COMMENT ON COLUMN public.orders.razorpay_order_id IS 'Razorpay order ID for payment tracking';
COMMENT ON COLUMN public.orders.razorpay_payment_id IS 'Razorpay payment ID after successful payment';

-- Create a function to update order payment status
CREATE OR REPLACE FUNCTION update_order_payment_status(
  order_uuid uuid,
  razorpay_order_id_param text,
  razorpay_payment_id_param text,
  payment_method_param text,
  payment_status_param text
) RETURNS void AS $$
BEGIN
  UPDATE public.orders 
  SET 
    razorpay_order_id = razorpay_order_id_param,
    razorpay_payment_id = razorpay_payment_id_param,
    payment_status = payment_status_param,
    updated_at = now()
  WHERE id = order_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_order_payment_status TO authenticated;

-- Create a view for admin panel to see payment information
CREATE OR REPLACE VIEW orders_with_payment_info AS
SELECT 
  o.*,
  CASE 
    WHEN o.razorpay_order_id IS NOT NULL THEN 'Razorpay'
    ELSE 'Unknown'
  END as payment_gateway,
  CASE 
    WHEN o.payment_status = 'paid' AND o.razorpay_payment_id IS NOT NULL THEN true
    ELSE false
  END as payment_verified
FROM public.orders o;

-- Grant select permission to authenticated users
GRANT SELECT ON orders_with_payment_info TO authenticated; 