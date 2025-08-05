-- Add 'draft' status to orders table constraint
-- This migration updates the status constraint to include the new 'draft' status

-- First, drop the existing constraint
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the new constraint with 'draft' status included
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY['draft'::text, 'pending'::text, 'confirmed'::text, 'processing'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]));

-- Also update the payment_status constraint to include 'cancelled' if not already present
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'cancelled'::text, 'refunded'::text]));

-- Update the default status to 'draft' for new orders
ALTER TABLE public.orders 
ALTER COLUMN status SET DEFAULT 'draft';

-- Add a comment to document the new status flow
COMMENT ON COLUMN public.orders.status IS 'Order status: draft -> confirmed -> processing -> shipped -> delivered. Cancelled for failed/abandoned orders.'; 