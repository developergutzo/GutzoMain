
-- Seed data for vendors table
-- Uses INSERT ... SELECT ... WHERE NOT EXISTS to avoid duplicates without strict unique constraints

WITH new_vendors (
    name, description, location, rating, image, 
    delivery_time, minimum_order, delivery_fee, cuisine_type, 
    phone, is_active, is_featured, tags, is_open
) AS (
  VALUES 
    (
        'Zero cals',
        'Healthy low calorie meals',
        'Peelamedu',
        4.2,
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
        '20-30 mins',
        150,
        20,
        'Balanced Diet',
        '',
        true,
        true,
        ARRAY['Balanced Diet', 'Low Calorie', 'High Protein'],
        true
    ),
    (
        'The fruit bowl co',
        'Fresh fruit bowls and vegan options',
        'Gandhipuram',
        4.5,
        'https://images.unsplash.com/photo-1464306076886-debede6bbf94?auto=format&fit=crop&w=400&q=80',
        '25-35 mins',
        120,
        15,
        'Fruit Bowl',
        '',
        true,
        true,
        ARRAY['Fruit Bowl', 'Vegan', 'Fresh Fruits'],
        true
    ),
    (
        'The buddha bowl',
        'Balanced vegetarian buddha bowls',
        'Sitra',
        4.3,
        'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
        '20-30 mins',
        130,
        18,
        'Buddha Bowl',
        '',
        true,
        true,
        ARRAY['Buddha Bowl', 'Balanced Diet', 'Vegetarian'],
        true
    ),
    (
        'Daily grubs',
        'South Indian home-style meals',
        'Neelambur',
        4.1,
        'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
        '20-30 mins',
        100,
        10,
        'South Indian Diet',
        '',
        true,
        true,
        ARRAY['South Indian Diet', 'Balanced Diet'],
        true
    ),
    (
        'Mealzy',
        'Low carb, high protein meals',
        'Chinniampalayam',
        4.0,
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
        '20-30 mins',
        110,
        12,
        'Low Carb',
        '',
        true,
        true,
        ARRAY['Low Carb', 'High Protein', 'Balanced Diet'],
        true
    ),
    (
        'Incredibowl Coimbatore',
        'Bowl meals for every diet',
        'Gandhipuram',
        4.4,
        'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80',
        '25-35 mins',
        140,
        16,
        'Bowl Meals',
        '',
        true,
        true,
        ARRAY['Bowl Meals', 'Balanced Diet'],
        true
    ),
    (
        'Padayal NO OIL NO BOIL Restaurant',
        'No oil, healthy South Indian food',
        'Sitra',
        4.3,
        'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
        '20-30 mins',
        125,
        14,
        'South Indian Diet',
        '',
        true,
        true,
        ARRAY['South Indian Diet', 'No Oil', 'Healthy'],
        true
    ),
    (
        'FooDelights',
        'Balanced diet and low calorie meals',
        'Peelamedu',
        4.2,
        'https://images.unsplash.com/photo-1464306076886-debede6bbf94?auto=format&fit=crop&w=400&q=80',
        '20-30 mins',
        115,
        13,
        'Balanced Diet',
        '',
        true,
        true,
        ARRAY['Balanced Diet', 'Low Calorie'],
        true
    ),
    (
        'food darzee',
        'High protein, low carb meals',
        'Neelambur',
        4.5,
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
        '25-35 mins',
        135,
        17,
        'High Protein',
        '',
        true,
        true,
        ARRAY['High Protein', 'Low Carb', 'Balanced Diet'],
        true
    )
)
INSERT INTO public.vendors (
    name, description, address, rating, image, 
    delivery_time, minimum_order, delivery_fee, cuisine_type, 
    phone, is_active, is_featured, tags, is_open
)
SELECT 
    nv.name, nv.description, nv.location, nv.rating, nv.image, 
    nv.delivery_time, nv.minimum_order, nv.delivery_fee, nv.cuisine_type, 
    nv.phone, nv.is_active, nv.is_featured, nv.tags, nv.is_open
FROM new_vendors nv
WHERE NOT EXISTS (
    SELECT 1 FROM public.vendors v WHERE v.name = nv.name
);
