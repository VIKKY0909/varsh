/*
  # Complete E-commerce System Schema

  1. New Tables
    - `user_profiles` - Extended user profile information
    - `addresses` - User shipping/billing addresses
    - `payment_methods` - Saved payment methods
    - `order_tracking` - Order status tracking
    - `notifications` - User notifications
    - `product_reviews` - Product reviews and ratings

  2. Updates to Existing Tables
    - Add fields to orders table for enhanced tracking
    - Add wishlist notifications

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user data access
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text,
  phone text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  profile_picture_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('shipping', 'billing', 'both')),
  is_default boolean DEFAULT false,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own addresses"
  ON addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Payment Methods Table (for saved payment info - not storing sensitive data)
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('card', 'upi', 'wallet')),
  is_default boolean DEFAULT false,
  display_name text NOT NULL,
  last_four text,
  expiry_month integer,
  expiry_year integer,
  provider text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Order Tracking Table
CREATE TABLE IF NOT EXISTS order_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  message text,
  location text,
  tracking_number text,
  estimated_delivery timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

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

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('order', 'wishlist', 'promotion', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  images text[] DEFAULT '{}',
  is_verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, order_id)
);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product reviews"
  ON product_reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their own reviews"
  ON product_reviews
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Add columns to existing orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_number text UNIQUE;
    ALTER TABLE orders ADD COLUMN shipping_cost numeric DEFAULT 0;
    ALTER TABLE orders ADD COLUMN tax_amount numeric DEFAULT 0;
    ALTER TABLE orders ADD COLUMN discount_amount numeric DEFAULT 0;
    ALTER TABLE orders ADD COLUMN notes text;
    ALTER TABLE orders ADD COLUMN estimated_delivery timestamptz;
    ALTER TABLE orders ADD COLUMN tracking_number text;
  END IF;
END $$;

-- Add wishlist notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wishlist' AND column_name = 'notify_on_stock'
  ) THEN
    ALTER TABLE wishlist ADD COLUMN notify_on_stock boolean DEFAULT true;
    ALTER TABLE wishlist ADD COLUMN notify_on_price_drop boolean DEFAULT true;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'VK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();