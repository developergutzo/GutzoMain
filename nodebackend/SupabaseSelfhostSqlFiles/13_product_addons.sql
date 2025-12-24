-- Add addon_ids column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS addon_ids uuid[] DEFAULT '{}';

COMMENT ON COLUMN public.products.addon_ids IS 'List of product IDs that are addons for this product';
