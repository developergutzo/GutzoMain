-- Add column to store 3rd party delivery info (Shadowfax, Dunzo, etc)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_partner_details JSONB DEFAULT '{}'::jsonb;

-- Example Data Structure:
-- {
--   "provider": "shadowfax",
--   "awb": "SF12345",
--   "tracking_url": "https://...",
--   "rider_name": "Raju",
--   "rider_phone": "9999999999"
-- }
