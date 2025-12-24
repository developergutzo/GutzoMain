-- Add auth columns to vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS password text;

-- Add comment
COMMENT ON COLUMN public.vendors.password IS 'Simple password storage for MVP. Hash in production.';
