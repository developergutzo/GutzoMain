-- Link 'Bisi Bele Bath' and 'Chicken Breast Meal' as addons for 'Benne Dosa'

UPDATE public.products
SET addon_ids = ARRAY(
    SELECT id 
    FROM public.products 
    WHERE name IN ('Bisi Bele Bath', 'Chicken Breast Meal')
)
WHERE name = 'Benne Dosa';

-- Verify the update
-- SELECT name, addon_ids FROM public.products WHERE name = 'Benne Dosa';
