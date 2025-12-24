-- Update vendor_id for specific products to 'Pitchammal''s Kitchen'

UPDATE public.products
SET vendor_id = (
    SELECT id 
    FROM public.vendors 
    WHERE name ILIKE '%Pitchammal%' 
    LIMIT 1
)
WHERE name IN (
    'Benne Dosa',
    'Bisi Bele Bath',
    'Chicken Breast Meal'
);

-- Comments for verification
-- This script updates the vendor_id of 'Benne Dosa', 'Bisi Bele Bath', and 'Chicken Breast Meal'
-- to the vendor ID associated with 'Pitchammal''s Kitchen'.
