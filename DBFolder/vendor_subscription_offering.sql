-- ============================================================================
-- VENDOR SUBSCRIPTION OFFERING - Single Entry
-- ============================================================================
-- Creates ONE subscription offering that will appear on vendor's page
-- ============================================================================

-- OPTION 1: Meal Plan Subscription Offering (Weekly/Monthly Meal Plans)
-- This creates a subscription plan like "Protein Power" or "Weight Loss Plan"
-- ============================================================================

INSERT INTO public.meal_plans (
    id,
    vendor_id,
    title,
    description,
    thumbnail,
    banner_url,
    price_display,
    schedule,
    features,
    plan_type,
    dietary_type,
    calories_per_day,
    includes_breakfast,
    includes_lunch,
    includes_dinner,
    includes_snacks,
    rating,
    review_count,
    min_duration_days,
    max_duration_days,
    is_active,
    is_featured,
    vendor_name,
    price_breakfast,
    price_lunch,
    price_dinner,
    price_snack,
    trust_text,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM vendors LIMIT 1),  -- Uses first vendor in your database
    'Daily Protein Power Meal Plan',
    'High-protein balanced meals delivered fresh daily. Perfect for fitness enthusiasts and muscle building. Includes customizable meal options with 40g+ protein per meal.',
    'https://example.com/protein-plan-thumbnail.jpg',
    'https://example.com/protein-plan-banner.jpg',
    'Starting from ₹258/day',
    'Daily delivery at your chosen time',
    ARRAY[
        'High protein meals (40g+ per meal)',
        'Fresh ingredients daily',
        'Customizable delivery days',
        'Pause/Resume anytime',
        'Nutritionist approved',
        'Track macros in app'
    ],
    'muscle_gain',  -- Options: weight_loss, muscle_gain, balanced, detox, keto, general
    'non-veg',      -- Options: veg, non-veg, vegan, eggetarian
    2000,
    true,   -- includes_breakfast
    true,   -- includes_lunch
    true,   -- includes_dinner
    false,  -- includes_snacks
    4.7,
    156,    -- review count
    7,      -- minimum 7 days
    90,     -- maximum 90 days
    true,   -- is_active (will show on vendor page)
    true,   -- is_featured (highlighted on vendor page)
    (SELECT name FROM vendors LIMIT 1),
    89.00,  -- breakfast price
    129.00, -- lunch price
    129.00, -- dinner price
    49.00,  -- snack price (if customer adds)
    '🔥 96% choose to continue after first week',
    now(),
    now()
);

-- ============================================================================
-- VERIFY: Check if subscription offering appears
-- ============================================================================
-- Run this to see your newly created subscription offering:
-- 
-- SELECT 
--     mp.id,
--     mp.title,
--     mp.vendor_name,
--     mp.price_display,
--     mp.is_active,
--     mp.is_featured,
--     mp.plan_type,
--     mp.dietary_type
-- FROM meal_plans mp
-- ORDER BY mp.created_at DESC
-- LIMIT 1;

-- ============================================================================
-- To see all subscription offerings for a specific vendor:
-- ============================================================================
-- SELECT * FROM meal_plans WHERE vendor_id = 'YOUR_VENDOR_ID';
