-- ============================================================
-- PRODUCT REVIEWS SYSTEM
-- ============================================================

-- 1. Create the reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  images text[] DEFAULT '{}',
  is_verified_purchase boolean DEFAULT false,
  status text DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id) -- One review per user per product
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.product_reviews(status);

-- 3. Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Everyone can view approved reviews
CREATE POLICY "Approved reviews are viewable by everyone" ON public.product_reviews
  FOR SELECT USING (status = 'approved');

-- Users can see their own reviews regardless of status
CREATE POLICY "Users can view own reviews" ON public.product_reviews
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Authenticated users can insert reviews
CREATE POLICY "Users can insert own reviews" ON public.product_reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews (e.g., status might reset to pending if edited)
CREATE POLICY "Users can update own reviews" ON public.product_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON public.product_reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admin can do everything
CREATE POLICY "Admin can manage all reviews" ON public.product_reviews
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND auth.users.email = 'vikivahane@gmail.com'
    )
  );

-- 5. Helper function to check if user has purchased the product
CREATE OR REPLACE FUNCTION public.has_purchased_product(p_user_id uuid, p_product_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    WHERE o.user_id = p_user_id 
    AND oi.product_id = p_product_id
    AND o.payment_status = 'paid'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger to update updated_at
CREATE TRIGGER set_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Storage Bucket for Review Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public read access for review images" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-images');

CREATE POLICY "Users can delete own review images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);
