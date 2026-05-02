-- ============================================================
-- ADMIN REPLY & LIKES SUPPORT
-- ============================================================

-- 1. Add admin response columns to product_reviews
ALTER TABLE public.product_reviews
ADD COLUMN IF NOT EXISTS admin_reply text,
ADD COLUMN IF NOT EXISTS admin_replied_at timestamptz,
ADD COLUMN IF NOT EXISTS admin_liked boolean DEFAULT false;

-- 2. Add an index for admin liked reviews (optional but good for performance)
CREATE INDEX IF NOT EXISTS idx_reviews_admin_liked ON public.product_reviews(admin_liked) WHERE admin_liked = true;
