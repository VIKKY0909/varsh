-- Add check constraint to prevent negative stock
ALTER TABLE public.products
ADD CONSTRAINT check_stock_quantity_non_negative
CHECK (stock_quantity >= 0);
