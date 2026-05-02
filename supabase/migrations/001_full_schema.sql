-- ============================================================
-- VARSH ETHNIC WEAR — COMPLETE DATABASE SCHEMA
-- Run this in your new Supabase project's SQL Editor
-- ============================================================

-- ============================================================
-- 1. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  original_price numeric NOT NULL,
  category text NOT NULL,
  size text[] NOT NULL DEFAULT '{}',
  color text,
  material text,
  care_instructions text,
  images text[] NOT NULL DEFAULT '{}',
  stock_quantity integer NOT NULL DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_new boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  has_delivery_charge boolean DEFAULT false,
  delivery_charge numeric DEFAULT 0,
  free_delivery_threshold numeric DEFAULT 999,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. USER PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  date_of_birth date,
  gender text,
  profile_picture_url text,
  email text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. ADDRESSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'India',
  type text DEFAULT 'shipping',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 4. CART ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  size text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 5. ORDERS TABLE (with COD support built-in)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  order_number text UNIQUE DEFAULT ('ORD-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  total_amount numeric NOT NULL,
  shipping_cost numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'online',
  shipping_address jsonb NOT NULL,
  notes text,
  estimated_delivery timestamptz,
  tracking_number text,
  canceled boolean DEFAULT false,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- 6. ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity integer NOT NULL,
  size text NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 7. WISHLIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  notify_on_stock boolean DEFAULT false,
  notify_on_price_drop boolean DEFAULT false,
  notify_when_available boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- 8. ORDER TRACKING TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  message text,
  location text,
  estimated_delivery timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 9. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'order',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_order ON public.order_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON public.user_profiles(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: Anyone can read, authenticated can insert/update (admin check in frontend)
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" ON public.products
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products" ON public.products
  FOR DELETE TO authenticated USING (true);

-- USER PROFILES: Users manage their own profile, admin can see all
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" ON public.user_profiles
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'vikivahane@gmail.com'
    )
  );

-- ADDRESSES: Users manage their own
CREATE POLICY "Users can view own addresses" ON public.addresses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON public.addresses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.addresses
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.addresses
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- CART ITEMS: Users manage their own
CREATE POLICY "Users can view own cart" ON public.cart_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own cart" ON public.cart_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON public.cart_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart" ON public.cart_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ORDERS: Users can view own, admin can view/update all
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all orders" ON public.orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'vikivahane@gmail.com'
    )
  );

CREATE POLICY "Admin can update all orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'vikivahane@gmail.com'
    )
  );

CREATE POLICY "Admin can delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'vikivahane@gmail.com'
    )
  );

-- ORDER ITEMS: Users can view own, admin can view all
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'vikivahane@gmail.com'
    )
  );

-- WISHLIST: Users manage their own
CREATE POLICY "Users can view own wishlist" ON public.wishlist
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist" ON public.wishlist
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist" ON public.wishlist
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own wishlist" ON public.wishlist
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ORDER TRACKING: Users can view tracking for their own orders, admin can manage all
CREATE POLICY "Users can view own order tracking" ON public.order_tracking
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders WHERE orders.id = order_tracking.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated can insert tracking" ON public.order_tracking
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin can view all tracking" ON public.order_tracking
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'vikivahane@gmail.com'
    )
  );

-- NOTIFICATIONS: Users manage their own
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ADMIN ORDERS FLAT VIEW
-- ============================================================
CREATE OR REPLACE VIEW public.admin_orders_flat AS
SELECT 
  o.id as order_id,
  o.order_number,
  o.total_amount,
  o.status,
  o.created_at,
  o.payment_status,
  o.payment_method,
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
  
  oi.id as order_item_id,
  oi.quantity,
  oi.size,
  oi.price as item_price,
  oi.product_id,
  
  p.name as product_name,
  p.images as product_images,
  p.price as product_current_price,
  
  u.email as user_email,
  
  up.full_name as user_full_name,
  up.phone as user_phone,
  up.gender as user_gender,
  up.date_of_birth as user_date_of_birth,
  
  CASE 
    WHEN o.payment_status = 'paid' THEN o.updated_at
    ELSE NULL
  END as payment_timestamp,
  
  CASE 
    WHEN o.estimated_delivery IS NOT NULL THEN 
      to_char(o.estimated_delivery, 'Day, DD Mon YYYY')
    ELSE NULL
  END as estimated_delivery_day,
  
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

-- Create alias view used by OrderManagement.tsx
CREATE OR REPLACE VIEW public.admin_orders_flat_view AS
SELECT * FROM public.admin_orders_flat;

-- Grant access to authenticated users
GRANT SELECT ON public.admin_orders_flat TO authenticated;
GRANT SELECT ON public.admin_orders_flat_view TO authenticated;

-- ============================================================
-- ADMIN RPC FUNCTION: Get all users for admin panel
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  phone text,
  gender text,
  date_of_birth text,
  is_admin boolean,
  created_at timestamptz,
  profile_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admin to call this function
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'vikivahane@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email::text,
    COALESCE(up.full_name, 'Not set')::text as full_name,
    COALESCE(up.phone, 'Not set')::text as phone,
    COALESCE(up.gender, 'Not set')::text as gender,
    COALESCE(up.date_of_birth::text, 'N/A')::text as date_of_birth,
    COALESCE(up.is_admin, false) as is_admin,
    u.created_at,
    CASE 
      WHEN up.id IS NOT NULL THEN 'Profile Complete'
      ELSE 'No Profile'
    END::text as profile_status
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON u.id = up.user_id
  ORDER BY u.created_at DESC;
END;
$$;

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- STORAGE BUCKET: product-images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product images
CREATE POLICY "Public read access for product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update product images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'product-images');

-- Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-images');


-- ============================================================
-- SEED DATA: All 9 Products from live database
-- ============================================================
INSERT INTO public.products (id, name, description, price, original_price, category, size, color, material, care_instructions, images, stock_quantity, is_featured, is_new, is_bestseller, has_delivery_charge, delivery_charge, free_delivery_threshold, created_at, updated_at)
VALUES
  (
    '7ab23e88-0125-475f-a6b3-d5b0509cadfb',
    'Pushpika ( पुष्पिका )',
    'The kurti is tailored in a sleeveless halter-neck silhouette with a flattering v-cut neckline, giving it a modern twist while maintaining ethnic grace. Its flowy A-line cut provides both comfort and style, making it perfect for casual evenings, festive brunches, or city strolls under the sunset sky.

Pair it with dark denim, oxidized earrings, or delicate juttis to create a soft, feminine look that feels effortlessly beautiful just like the name suggests.',
    599, 1200, 'party', ARRAY['M'], 'Pink', '100% breathable cotton', 'Wash Gently',
    ARRAY['https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753382954942-ksnbsupzq-1.jpg','https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753382965634-inug5a49a-0.jpg'],
    1, false, false, false, false, 0, 999,
    '2025-07-24T18:53:37.229+00:00', '2025-09-05T08:38:13.423+00:00'
  ),
  (
    '38a1e81d-45dd-46a6-b71e-b71692675a6f',
    'IndiRatri ( इंदिरात्रि )',
    'Infuse elegance into your everyday wardrobe with our IndiRatri Cotton Kurti, a timeless piece that blends simplicity with ethnic charm. This sleeveless kurti features a jet-black base adorned with delicate white hand-block inspired floral motifs, creating a beautiful contrast that''s both bold and graceful.
The design is elevated with tie-up shoulder straps, giving it a playful and youthful edge, perfect for summer days or casual getaways. The A-line cut ensures a flattering fit, while the soft, breathable cotton fabric keeps you cool and comfortable all day long.',
    449, 950, 'casual', ARRAY['S','M','L','XL'], 'Dark ', '100% breathable cotton', 'Wash Gently',
    ARRAY['https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753381435499-vsp720hl7-0.jpg','https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753382550145-0lf3sbsyx-0.jpg'],
    3, false, false, false, false, 0, 999,
    '2025-07-24T18:30:44.281+00:00', '2025-09-05T19:36:12.132+00:00'
  ),
  (
    'ee6e8d88-d745-41ad-975e-7dc7299b3a92',
    'Hansa ( हंसा )',
    'The kurti comes in a modern straight-fit cut with wide straps and a square neckline that enhances your collarbones and adds a structured, graceful look. The all-over floral pattern is inspired by traditional block prints but with a contemporary twist, making it perfect for both college wear and casual day-outs.
This versatile piece pairs effortlessly with denim, palazzos, or ethnic bottoms for a fusion look that''s bold, bright, and unapologetically feminine.',
    399, 899, 'casual', ARRAY['M','L','XL'], 'Soft off-white with Sky blue print ', '100% breathable cotton', 'Wash Gently',
    ARRAY['https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753382099857-b9u1bn0el-1.jpg','https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753383335194-gj8xyveyt-0.jpg'],
    3, false, false, false, false, 0, 999,
    '2025-07-24T18:40:55.272+00:00', '2025-09-05T08:38:25.331+00:00'
  ),
  (
    'cc035da4-bc1d-4801-8db0-d63d9cd296b4',
    'Raktima ( रक्तिमा )',
    'Elevate your ethnic wardrobe with our Gulmohar Grace Printed Kurti, a stunning blend of tradition and modern elegance. This kurti features a vibrant floral block print in warm rust and crimson tones that effortlessly captures the charm of Indian heritage. The intricate pattern runs uniformly across the fabric, giving it a rich and artisanal appeal.',
    499, 1100, 'formal', ARRAY['S','M','L'], 'Dark Maroon with Gulmohar Grace Printed ', '100% breathable cotton', 'Wash Gentle and Separately',
    ARRAY['https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753381104151-k74ejjejt-0.jpg','https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753382593132-ow72kovjw-0.jpg'],
    1, false, false, false, false, 100, 999,
    '2025-07-24T18:21:29.073+00:00', '2025-09-24T19:57:52.559+00:00'
  ),
  (
    'd8ad0d17-8517-4f78-9a65-23785bd64995',
    'HemLata ( हेमलता )',
    'This kurti stands out with its vibrant mustard yellow base adorned with paisley and floral-inspired block prints in deep red and olive hues capturing the spirit of blooming gardens in spring.

What sets this piece apart is its wrap-style illusion front panel with a delicate gota patti lace trim running diagonally, adding a subtle shimmer and a festive flair. Designed sleeveless with a relaxed silhouette, it''s crafted from lightweight, breathable cotton perfect for hot days and cheerful moods.',
    449, 999, 'festive', ARRAY['S','M','L','XL'], 'Yellow ', '100% breathable cotton', 'Wash Gently',
    ARRAY['https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753382681473-md67djnlg-0.jpg'],
    4, false, false, false, false, 99, 999,
    '2025-07-24T18:48:24.554+00:00', '2025-09-24T19:58:01.374+00:00'
  ),
  (
    'a70fdbee-20cf-403d-b882-2e542b7fc868',
    'Devika ( देविका )',
    'Unleash your bold and beautiful side with our Devika Crimson Backlace Kurti, a modern ethnic piece that turns heads from every angle. This sleeveless kurti features a rich crimson-red base adorned with mustard yellow hand-block style leaf motifs, giving it a vibrant, earthy elegance.

The standout detail? A stunning lace-up back design that adds a playful yet graceful twist to the traditional kurti silhouette. Made from lightweight, breathable cotton, the kurti ensures all-day comfort without compromising on charm. Its straight-cut fit with side slits makes it perfect for pairing with jeans, palazzos, or traditional churidars.

Whether you''re heading to a rooftop evening with friends or a festive day out, Devika is designed to be effortlessly chic and divinely confident.',
    599, 1200, 'party', ARRAY['M'], 'Bold crimson red for a festive and vibrant look', '100% breathable cotton', 'Wash Gently',
    ARRAY['https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753384171845-q32uv3j4h-0.jpg','https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753384176068-q3cw9mlf9-0.jpg','https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753384218329-uenyvfzbo-0.jpg'],
    0, false, false, false, false, 0, 999,
    '2025-07-24T19:02:25.538+00:00', '2025-09-05T08:38:08.217+00:00'
  ),
  (
    'f40e2b16-5179-403b-8559-9806e893bf8c',
    'Devarshi ( देवर्षि )',
    'Elevate your ethnic wardrobe with our Devarshi Strap Kurti, a fusion of contemporary style and traditional charm. Crafted in a rich purple hue adorned with delicate hand-block-style motifs, this sleeveless kurti is perfect for warm days and festive nights. The ruched front design flatters your silhouette while the adjustable straps add a touch of modern elegance. Made with breathable cotton fabric to keep you comfortable all day long.',
    499, 1200, 'party', ARRAY['M'], 'Purple', '100% breathable cotton', 'Wash Gentle',
    ARRAY['https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1753559024093-l4itbgvzl-0.jpg'],
    1, false, false, false, false, 1, 999,
    '2025-07-26T19:47:09.641+00:00', '2025-09-05T20:08:04.858+00:00'
  ),
  (
    '4564bfbb-bc29-486d-92e4-16655e8331b2',
    'Rekha ( रेखा )',
    '✨ Rekha Kurti – Elegant Charm with a Modern Twist

Step into effortless grace with the Rekha Kurti, a beautiful blend of traditional inspiration and contemporary style. Designed with a striking black base adorned with delicate white floral prints, this sleeveless kurti radiates feminine charm and bold confidence.',
    429, 999, 'party', ARRAY['M'], 'Black ', '100% Breathable Cotton ', 'Hand wash',
    ARRAY['https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1754681559262-cs2kl5z0f-0.png','https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1754681571481-uzbvaq6oe-0.jpg'],
    1, true, false, false, true, 100, 999,
    '2025-08-08T19:35:27.999+00:00', '2026-04-22T09:27:01.007+00:00'
  ),
  (
    '2901ceab-1d63-43fd-b773-5ec47b9e5b25',
    'Wollen Hair Extension ',
    'Add a touch of tradition and style to your look with these colorful hair braiding threads. Perfect for festivals, Navratri, Garba, weddings, and cultural events, these vibrant threads are designed to be tied with ponytails or braids. Each set comes in multiple bright colors that enhance your hairstyle instantly, giving you an ethnic yet trendy appearance.',
    100, 250, 'festive', ARRAY['S','M'], 'Mix Colour', 'Soft cotton/polyester thread', 'Careful from Heat',
    ARRAY['https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1757063912982-mewsr446o-2.jpg','https://qajswgkrjldtugyymydg.supabase.co/storage/v1/object/public/product-images/1757065649846-r3ovqu1ut-0.jpg'],
    5, false, false, false, true, 99, 999,
    '2025-09-05T09:19:18.813+00:00', '2026-04-22T09:26:13.46+00:00'
  );

-- ============================================================
-- DONE! Your database is now fully set up.
-- ============================================================
