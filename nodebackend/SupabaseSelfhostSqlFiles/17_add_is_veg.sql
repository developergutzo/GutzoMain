-- Add is_veg column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_veg boolean DEFAULT true;

-- Backfill data from 'type' column
UPDATE public.products 
SET is_veg = (type = 'veg' OR type IS NULL);
