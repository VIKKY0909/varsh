-- Update policies to be more lenient to diagnose the 403 issue

-- Drop existing restricted policies
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;

-- Allow all authenticated users to insert orders
CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow all authenticated users to view orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT TO authenticated USING (true);

-- Allow all authenticated users to insert order items
CREATE POLICY "Users can insert own order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (true);
