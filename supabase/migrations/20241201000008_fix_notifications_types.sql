-- Fix notifications table to include payment-related notification types
-- This migration updates the type constraint to include payment notification types

-- Drop the existing constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the new constraint with payment notification types included
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY['order'::text, 'wishlist'::text, 'promotion'::text, 'system'::text, 'payment_success'::text, 'payment_failed'::text, 'payment_cancelled'::text]));

-- Add a comment to document the notification types
COMMENT ON COLUMN public.notifications.type IS 'Notification types: order, wishlist, promotion, system, payment_success, payment_failed, payment_cancelled'; 