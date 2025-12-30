-- Add columns for Shadowfax integration
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shadowfax_order_id text,
ADD COLUMN IF NOT EXISTS pickup_otp text,
ADD COLUMN IF NOT EXISTS delivery_otp text, -- Ensuring this exists as verified in schema, but good to double check or add if missing from verified dump
ADD COLUMN IF NOT EXISTS rider_name text,
ADD COLUMN IF NOT EXISTS rider_phone text,
ADD COLUMN IF NOT EXISTS rider_coordinates jsonb,
ADD COLUMN IF NOT EXISTS delivery_status text;

-- Add comment for clarity
COMMENT ON COLUMN public.orders.shadowfax_order_id IS 'Order ID returned by Shadowfax API';
COMMENT ON COLUMN public.orders.rider_coordinates IS 'Latest known {lat, lng} of the rider';
