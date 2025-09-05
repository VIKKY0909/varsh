/*
  # Add delivery charges to products table

  1. New Fields
    - `has_delivery_charge` (boolean, whether this product has delivery charges)
    - `delivery_charge` (numeric, delivery charge amount in rupees)
    - `free_delivery_threshold` (numeric, minimum order amount for free delivery)

  2. Default Values
    - `has_delivery_charge` defaults to false (free delivery)
    - `delivery_charge` defaults to 0
    - `free_delivery_threshold` defaults to 999 (free delivery above ₹999)
*/

-- Add delivery charge fields to products table
ALTER TABLE products 
ADD COLUMN has_delivery_charge boolean DEFAULT false,
ADD COLUMN delivery_charge numeric DEFAULT 0 CHECK (delivery_charge >= 0),
ADD COLUMN free_delivery_threshold numeric DEFAULT 999 CHECK (free_delivery_threshold >= 0);

-- Add index for better performance on delivery charge queries
CREATE INDEX IF NOT EXISTS idx_products_delivery_charge ON products(has_delivery_charge);
CREATE INDEX IF NOT EXISTS idx_products_delivery_amount ON products(delivery_charge);

-- Update existing products to have free delivery by default
UPDATE products 
SET 
  has_delivery_charge = false,
  delivery_charge = 0,
  free_delivery_threshold = 999
WHERE has_delivery_charge IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.has_delivery_charge IS 'Whether this product has delivery charges';
COMMENT ON COLUMN products.delivery_charge IS 'Delivery charge amount in rupees';
COMMENT ON COLUMN products.free_delivery_threshold IS 'Minimum order amount for free delivery';
