-- Add missing columns to cart table
ALTER TABLE public.cart 
ADD COLUMN IF NOT EXISTS variant_id uuid,
ADD COLUMN IF NOT EXISTS addons jsonb,
ADD COLUMN IF NOT EXISTS special_instructions text;
