-- Append '[addon]' to the names of 'Bisi Bele Bath' and 'Chicken Breast Meal'

UPDATE public.products
SET name = name || ' [addon]'
WHERE name IN ('Bisi Bele Bath', 'Chicken Breast Meal')
AND name NOT LIKE '%[addon]%';

-- Verify the update
-- SELECT name FROM public.products WHERE name LIKE '%[addon]%';
