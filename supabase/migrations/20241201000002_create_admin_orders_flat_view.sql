-- Create admin_orders_flat view for admin panel
-- This view provides a flat structure for order data that can be easily grouped on the frontend

CREATE OR REPLACE VIEW admin_orders_flat AS
SELECT 
  -- Order fields
  o.id as order_id,
  o.order_number,
  o.total_amount,
  o.status,
  o.created_at,
  o.payment_status,
  o.shipping_cost,
  o.tax_amount,
  o.discount_amount,
  o.notes,
  o.estimated_delivery,
  o.tracking_number,
  o.canceled,
  o.razorpay_order_id,
  o.razorpay_payment_id,
  o.shipping_address,
  o.user_id,
  
  -- Order item fields
  oi.id as order_item_id,
  oi.quantity,
  oi.size,
  oi.price as item_price,
  oi.product_id,
  
  -- Product fields
  p.name as product_name,
  p.images as product_images,
  p.price as product_current_price,
  
  -- User fields
  u.email as user_email,
  
  -- User profile fields
  up.full_name as user_full_name,
  up.phone as user_phone,
  up.gender as user_gender,
  up.date_of_birth as user_date_of_birth,
  
  -- Payment timestamp (when payment_status changed to 'paid')
  CASE 
    WHEN o.payment_status = 'paid' THEN o.updated_at
    ELSE NULL
  END as payment_timestamp,
  
  -- Estimated delivery day (formatted)
  CASE 
    WHEN o.estimated_delivery IS NOT NULL THEN 
      to_char(o.estimated_delivery, 'Day, DD Mon YYYY')
    ELSE NULL
  END as estimated_delivery_day,
  
  -- Days until delivery
  CASE 
    WHEN o.estimated_delivery IS NOT NULL THEN 
      o.estimated_delivery::date - CURRENT_DATE
    ELSE NULL
  END as days_until_delivery

FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
LEFT JOIN public.products p ON oi.product_id = p.id
LEFT JOIN auth.users u ON o.user_id = u.id
LEFT JOIN public.user_profiles up ON u.id = up.user_id
ORDER BY o.created_at DESC, oi.id;

-- Grant select permission to authenticated users
GRANT SELECT ON admin_orders_flat TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW admin_orders_flat IS 'Flat view of orders with items, products, and user information for admin panel'; 