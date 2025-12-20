-- ==========================================
-- MEAL PLAN DYNAMIC UI UPDATES & SEED DATA (ROBUST ID LINKING)
-- ==========================================

-- 1. Schema Updates
ALTER TABLE public.meal_plans
DROP COLUMN IF EXISTS trial_title,
DROP COLUMN IF EXISTS trial_subtitle,
DROP COLUMN IF EXISTS routine_title,
DROP COLUMN IF EXISTS routine_subtitle,
DROP COLUMN IF EXISTS popular_tag_text,
DROP COLUMN IF EXISTS trial_price,
DROP COLUMN IF EXISTS price_per_day,
DROP COLUMN IF EXISTS price_per_week;

ALTER TABLE public.meal_plans
ADD COLUMN IF NOT EXISTS trust_text TEXT DEFAULT '96%',
ADD COLUMN IF NOT EXISTS vendor_name TEXT,
ADD COLUMN IF NOT EXISTS price_breakfast DECIMAL(10,2) DEFAULT 89.00,
ADD COLUMN IF NOT EXISTS price_lunch DECIMAL(10,2) DEFAULT 129.00,
ADD COLUMN IF NOT EXISTS price_dinner DECIMAL(10,2) DEFAULT 129.00,
ADD COLUMN IF NOT EXISTS price_snack DECIMAL(10,2) DEFAULT 49.00;

ALTER TABLE public.meal_plan_day_menu
ADD COLUMN IF NOT EXISTS breakfast_item TEXT,
ADD COLUMN IF NOT EXISTS lunch_item TEXT,
ADD COLUMN IF NOT EXISTS dinner_item TEXT,
ADD COLUMN IF NOT EXISTS snack_item TEXT;

-- 2. Ensure Meal Plans Exist (Upsert by ID if possible, or distinct params)
UPDATE public.meal_plans SET trust_text = '96%', price_display = '₹49/day' WHERE is_active = true;


-- 3. SEED MENU ITEMS (Dynamic Linking)
-- We clear the table first to avoid duplicates or orphans
TRUNCATE TABLE public.meal_plan_day_menu;

-- Helper to insert week for a specific plan title
-- SUNDAY IS ALWAYS NULL for items

-- Plan: Protein Power
INSERT INTO public.meal_plan_day_menu (id, meal_plan_id, day_of_week, day_name, breakfast_item, lunch_item, dinner_item, snack_item)
SELECT gen_random_uuid(), id, day_num, day_str, b_item, l_item, d_item, s_item
FROM public.meal_plans,
(VALUES 
    (0, 'Sunday', 'Sunday Special Pancakes', 'Sunday Roast Chicken', 'Light Salad', 'Ice Cream'),
    (1, 'Monday', 'Protein Oatmeal + Berries', 'Turkey Meatballs + Brown Rice', 'Lean Beef Stir Fry + Broccoli', 'Greek Yogurt'),
    (2, 'Tuesday', NULL, NULL, NULL, NULL), -- Testing Tuesday Rest Day
    (3, 'Wednesday', 'Greek Yogurt + Granola', 'Chicken Caesar Salad (No Dressing)', 'Grilled Fish Tacos (Low carb)', 'Almonds & Apple'),
    (4, 'Thursday', 'Scrambled Eggs + Spinach', 'Tuna Salad + Sweet Potato', 'Chicken Tikka + Roti', 'Boiled Eggs'),
    (5, 'Friday', 'Protein Pancakes + Honey', 'Grilled Shrimp + Avocado Salad', 'Lamp Chops + Mash', 'Cottage Cheese'),
    (6, 'Saturday', 'Smoothie Bowl (Whey Protein)', 'Chicken Burrito Bowl', 'Steak + Asparagus', 'Hummus & Carrots')
) AS t(day_num, day_str, b_item, l_item, d_item, s_item)
WHERE title ILIKE '%Protein Power%' AND is_active = true 
LIMIT 7;

-- Plan: Balanced Meal
INSERT INTO public.meal_plan_day_menu (id, meal_plan_id, day_of_week, day_name, breakfast_item, lunch_item, dinner_item, snack_item)
SELECT gen_random_uuid(), id, day_num, day_str, b_item, l_item, d_item, s_item
FROM public.meal_plans,
(VALUES 
    (0, 'Sunday', 'Sunday Special Pancakes', 'Sunday Roast Chicken', 'Light Salad', 'Ice Cream'),
    (1, 'Monday', 'Idly & Sambar', 'Sambar Rice & Poriyal', 'Chapati & Paneer Gravy', 'Masala Corn'),
    (2, 'Tuesday', 'Dosa & Chutney', 'Curd Rice & Pickle', 'Chapati & Dal Fry', 'Fruit Chat'),
    (3, 'Wednesday', 'Pongal & Vada', 'Veg Biryani + Raita', 'Roti & Mix Veg Curry', 'Sprouts Salad'),
    (4, 'Thursday', 'Upma & Kesari', 'Lemon Rice + Potato Fry', 'Phulka & Aloo Gobi', 'Roasted Peanuts'),
    (5, 'Friday', 'Poori & Potato Masala', 'Full Thali Meal', 'Idiyappam & Kurma', 'Sundal'),
    (6, 'Saturday', 'Rava Dosa', 'Pulao & Paneer Butter', 'Parotta & Salna', 'Banana Muffins')
) AS t(day_num, day_str, b_item, l_item, d_item, s_item)
WHERE title ILIKE '%Balanced%' AND is_active = true 
LIMIT 7;

-- Plan: Veggie Delight
INSERT INTO public.meal_plan_day_menu (id, meal_plan_id, day_of_week, day_name, breakfast_item, lunch_item, dinner_item, snack_item)
SELECT gen_random_uuid(), id, day_num, day_str, b_item, l_item, d_item, s_item
FROM public.meal_plans,
(VALUES 
    (0, 'Sunday', NULL, NULL, NULL, NULL),
    (1, 'Monday', 'Fruit Bowl', 'Greek Salad', 'Roasted Vegetable Soup', 'Carrot Sticks'),
    (2, 'Tuesday', 'Avocado Toast', 'Quinoa Salad', 'Zucchini Noodles', 'Celery & Dip'),
    (3, 'Wednesday', 'Oats & Nuts', 'Spinach Corn Sandwich', 'Pumpkin Soup + Bread', 'Mixed Berries'),
    (4, 'Thursday', 'Besan Chilla', 'Grilled Paneer Salad', 'Stuffed Capsicum', 'Cucumber Slices'),
    (5, 'Friday', 'Smoothie Bowl', 'Buddha Bowl', 'Minestrone Soup', 'Roasted Chickpeas'),
    (6, 'Saturday', 'Poha + Peanuts', 'Veg Wrap', 'Grilled Mushrooms + Mash', 'Apple Slices')
) AS t(day_num, day_str, b_item, l_item, d_item, s_item)
WHERE title ILIKE '%Veggie%' AND is_active = true 
LIMIT 7;

-- Plan: Keto Power
INSERT INTO public.meal_plan_day_menu (id, meal_plan_id, day_of_week, day_name, breakfast_item, lunch_item, dinner_item, snack_item)
SELECT gen_random_uuid(), id, day_num, day_str, b_item, l_item, d_item, s_item
FROM public.meal_plans,
(VALUES 
    (0, 'Sunday', NULL, NULL, NULL, NULL),
    (1, 'Monday', 'Bacon & Eggs', 'Caesar Salad (No Croutons)', 'Grilled Salmon + Asparagus', 'Cheese Cubes'),
    (2, 'Tuesday', 'Avocado & Egg Boat', 'Keto Chicken Salad', 'Zucchini Lasagna', 'Pork Rinds'),
    (3, 'Wednesday', 'Bulletproof Coffee', 'Tuna Lettuce Wraps', 'Steak & Buttered Broccoli', 'Macadamia Nuts'),
    (4, 'Thursday', 'Chia Seed Pudding', 'Egg Salad Bowl', 'Chicken Parm (Almond Flour)', 'Keto Bombs'),
    (5, 'Friday', 'Sausage & Cheese Omelette', 'Cobb Salad', 'Grilled Shrim & Cauliflower Rice', 'Beef Jerky'),
    (6, 'Saturday', 'Keto Pancakes', 'Burger Patty (No Bun)', 'Pork Chops + Green Beans', 'Olives')
) AS t(day_num, day_str, b_item, l_item, d_item, s_item)
WHERE title ILIKE '%Keto%' AND is_active = true 
LIMIT 7;

-- Plan: Weight Loss
INSERT INTO public.meal_plan_day_menu (id, meal_plan_id, day_of_week, day_name, breakfast_item, lunch_item, dinner_item, snack_item)
SELECT gen_random_uuid(), id, day_num, day_str, b_item, l_item, d_item, s_item
FROM public.meal_plans,
(VALUES 
    (0, 'Sunday', NULL, NULL, NULL, NULL),
    (1, 'Monday', 'Green Juice', 'Raw Papaya Salad', 'Clear Veg Soup', 'Green Tea'),
    (2, 'Tuesday', 'Watermelon Bowl', 'Cucumber & Mint Salad', 'Steamed Broccoli & Tofu', 'Detox Water'),
    (3, 'Wednesday', 'Aloe Vera Juice', 'Sprouts Salad', 'Lentil Soup (Thin)', 'Cucumber Sticks'),
    (4, 'Thursday', 'Citrus Fruit Bowl', 'Gazpacho', 'Roasted Pumpkin Salad', 'Grapefruit'),
    (5, 'Friday', 'Beetroot Juice', 'Carrot Ginger Soup', 'Steamed Veggies', 'Celery Juice'),
    (6, 'Saturday', 'Coconut Water + Chia', 'Mixed Green Salad', 'Tomato Basil Soup', 'Herbal Tea')
) AS t(day_num, day_str, b_item, l_item, d_item, s_item)
WHERE title ILIKE '%Weight%' AND is_active = true 
LIMIT 7;

-- Plan: Detox Week
INSERT INTO public.meal_plan_day_menu (id, meal_plan_id, day_of_week, day_name, breakfast_item, lunch_item, dinner_item, snack_item)
SELECT gen_random_uuid(), id, day_num, day_str, b_item, l_item, d_item, s_item
FROM public.meal_plans,
(VALUES 
    (0, 'Sunday', NULL, NULL, NULL, NULL),
    (1, 'Monday', 'Green Juice', 'Raw Papaya Salad', 'Clear Veg Soup', 'Citrus Water'),
    (2, 'Tuesday', 'Watermelon Bowl', 'Cucumber & Mint Salad', 'Steamed Broccoli & Tofu', 'Melon Slices'),
    (3, 'Wednesday', 'Aloe Vera Juice', 'Sprouts Salad', 'Lentil Soup (Thin)', 'Green Tea'),
    (4, 'Thursday', 'Citrus Fruit Bowl', 'Gazpacho', 'Roasted Pumpkin Salad', 'Cucumber Water'),
    (5, 'Friday', 'Beetroot Juice', 'Carrot Ginger Soup', 'Steamed Veggies', 'Carrot Juice'),
    (6, 'Saturday', 'Coconut Water + Chia', 'Mixed Green Salad', 'Tomato Basil Soup', 'Mint Water')
) AS t(day_num, day_str, b_item, l_item, d_item, s_item)
WHERE title ILIKE '%Detox%' AND is_active = true 
LIMIT 7;

-- Plan: Liquid Power
INSERT INTO public.meal_plan_day_menu (id, meal_plan_id, day_of_week, day_name, breakfast_item, lunch_item, dinner_item, snack_item)
SELECT gen_random_uuid(), id, day_num, day_str, b_item, l_item, d_item, s_item
FROM public.meal_plans,
(VALUES 
    (0, 'Sunday', NULL, NULL, NULL, NULL),
    (1, 'Monday', 'Banana Protein Shake', 'Berry Blast', 'Chocolate Peanut Butter', 'Protein Shot'),
    (2, 'Tuesday', 'Green Detox Smoothie', 'Mango Lassi', 'Avocado Spinah Shake', 'Coconut Water'),
    (3, 'Wednesday', 'Coffee Protein Shake', 'Strawberry Banana', 'Vanilla Almond', 'Almond Milk'),
    (4, 'Thursday', 'Blueberry Kale', 'Pineapple Coconut', 'Carrot Ginger', 'Ginger Shot'),
    (5, 'Friday', 'Oatmeal Cookie Shake', 'Apple Pie Smoothie', 'Mint Choc Chip', 'Cocoa Shake'),
    (6, 'Saturday', 'Tropical Punch', 'Watermelon Crush', 'Mixed Berry', 'Berry Juice')
) AS t(day_num, day_str, b_item, l_item, d_item, s_item)
WHERE title ILIKE '%Liquid%' AND is_active = true 
LIMIT 7;
