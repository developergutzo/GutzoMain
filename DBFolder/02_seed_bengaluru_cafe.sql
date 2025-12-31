-- Seed Data: Bengaluru Cafe
-- Description: Insert one vendor and one product for testing.

BEGIN;

-- 1. Insert Vendor: Bengaluru Cafe
WITH new_vendor AS (
    INSERT INTO public.vendors (
        name,
        description,
        image,
        rating,
        delivery_time,
        minimum_order,
        delivery_fee,
        cuisine_type,
        address,
        phone,
        is_active,
        is_open,
        opening_hours,
        latitude,
        longitude
    ) VALUES (
        'Bengaluru Cafe',
        'Authentic South Indian vegetarian delicacies served with love.',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2670&auto=format&fit=crop',
        4.8,
        '20-30 mins',
        100,
        30,
        'South Indian',
        '9th Main Rd, 2nd Block, Jaya Nagar East, Jayanagar, Bengaluru, Karnataka 560011',
        '8884445555',
        true,
        true,
        '[{"day": "Monday", "open": "07:00", "close": "22:00"}, {"day": "Tuesday", "open": "07:00", "close": "22:00"}, {"day": "Wednesday", "open": "07:00", "close": "22:00"}, {"day": "Thursday", "open": "07:00", "close": "22:00"}, {"day": "Friday", "open": "07:00", "close": "22:00"}, {"day": "Saturday", "open": "07:00", "close": "22:00"}, {"day": "Sunday", "open": "07:00", "close": "22:00"}]'::jsonb,
        12.9352,
        77.5802
    )
    RETURNING id
)

-- 2. Insert Product: Special Masala Dosa
INSERT INTO public.products (
    vendor_id,
    name,
    description,
    price,
    image_url,
    category,
    is_available,
    type,
    is_bestseller,
    is_featured
)
SELECT 
    id,
    'Special Masala Dosa',
    'Crispy golden crepe made from fermented rice and lentil batter, filled with spiced potato masala and served with coconut chutney and sambar.',
    85,
    'https://images.unsplash.com/photo-1668236543090-d2f8969536dd?q=80&w=2669&auto=format&fit=crop',
    'Dosa',
    true,
    'veg',
    true,
    true
FROM new_vendor;

COMMIT;
