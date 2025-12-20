-- 1. Ensure User 'Gowtham Sundaram' exists
-- Using the ID found in data.sql: b59be4e6-cc63-4f38-895f-c73e813f973c
INSERT INTO public.users (
    id, phone, name, email, verified, created_at, updated_at, 
    language_preference, total_orders, total_spent, loyalty_points, 
    membership_tier, is_blocked
) VALUES (
    'b59be4e6-cc63-4f38-895f-c73e813f973c', 
    '+919944751745', 
    'Gowtham Sundaram', 
    'gowthams@gma.com', 
    true, 
    NOW(), 
    NOW(), 
    'en', 
    0, 
    0.00, 
    0, 
    'bronze', 
    false
) ON CONFLICT (id) DO NOTHING;

-- 2. Create a Bangalore Address for this user
INSERT INTO public.user_addresses (
    id, 
    user_id, 
    type, 
    label, 
    street, 
    area, 
    landmark, 
    full_address, 
    city, 
    state, 
    country, 
    postal_code, 
    zipcode,
    latitude, 
    longitude, 
    is_default, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(), -- Generate a new UUID for the address
    'b59be4e6-cc63-4f38-895f-c73e813f973c', 
    'home', 
    'Bangalore Home', 
    '123, 4th Cross', 
    'Koramangala', 
    'Sony Signal', -- Shortened to fit varchar(15) limit (was 'Near Sony Signal', 16 chars)
    '123, 4th Cross, Koramangala, Bangalore, Karnataka 560034', 
    'Bangalore', 
    'Karnataka', 
    'India', 
    '560034', 
    '560034',
    12.9352, -- Lat for Koramangala
    77.6245, -- Long for Koramangala
    false, -- Not default unless requested
    NOW(), 
    NOW()
);

-- 3. Create a Vendor in Bangalore with Coordinates
INSERT INTO public.vendors (
    id, 
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
    is_featured, 
    tags, 
    created_at, 
    updated_at, 
    total_orders, 
    total_reviews, 
    is_open, 
    is_verified, 
    commission_rate, 
    payout_frequency, 
    status, 
    latitude, 
    longitude
) VALUES (
    gen_random_uuid(), -- New UUID for vendor
    'Bangalore Spice Kitchen', 
    'Authentic South Indian meals and tiffins', 
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop', 
    4.5, 
    '30-40 mins', 
    150.00, 
    20.00, 
    'South Indian', 
    'Indiranagar, Bangalore', 
    '+919876599999', -- Removed spaces to be safe
    true, 
    true, 
    '{South Indian, Breakfast, Tiffin}', 
    NOW(), 
    NOW(), 
    0, 
    0, 
    true, 
    true, 
    15.00, 
    'weekly', 
    'approved', 
    12.9784, -- Lat for Indiranagar
    77.6408  -- Long for Indiranagar
);

-- 4. Add Products for this Vendor
-- We need to retrieve the Vendor ID we just created.
-- Since we used gen_random_uuid(), we can't easily get it back in a simple script unless we fix the ID.
-- RE-CREATING VENDOR ENTRY WITH SPECIFIC ID TO ENABLE LINKING

DELETE FROM public.vendors WHERE name = 'Bangalore Spice Kitchen';

INSERT INTO public.vendors (
    id, 
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
    is_featured, 
    tags, 
    created_at, 
    updated_at, 
    total_orders, 
    total_reviews, 
    is_open, 
    is_verified, 
    commission_rate, 
    payout_frequency, 
    status, 
    latitude, 
    longitude
) VALUES (
    'a1b2c3d4-e5f6-4a1b-9c8d-1234567890ab', -- Hardcoded UUID for linking
    'Bangalore Spice Kitchen', 
    'Authentic South Indian meals and tiffins', 
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop', 
    4.5, 
    '30-40 mins', 
    150.00, 
    20.00, 
    'South Indian', 
    'Indiranagar, Bangalore', 
    '+919876599999', 
    true, 
    true, 
    '{South Indian, Breakfast, Tiffin}', 
    NOW(), 
    NOW(), 
    0, 
    0, 
    true, 
    true, 
    15.00, 
    'weekly', 
    'approved', 
    12.9784, 
    77.6408
) ON CONFLICT (id) DO NOTHING;

-- Product 1: Idli Sambar
INSERT INTO public.products (
    id, vendor_id, name, description, price, image_url, category, tags, 
    is_available, preparation_time, is_featured, is_bestseller
) VALUES (
    gen_random_uuid(), 
    'a1b2c3d4-e5f6-4a1b-9c8d-1234567890ab', -- Links to Bangalore Spice Kitchen
    'Soft Idli Sambar', 
    'Steamed rice cakes served with aromatic lentil stew and coconut chutney', 
    60.00, 
    'https://images.unsplash.com/photo-1589301760576-416b71677615?w=400&h=300&fit=crop', 
    'Breakfast', 
    '{Healthy,Steam,Breakfast}', 
    true, 
    15, -- Integer value for minutes
    true, 
    true
);

-- Product 2: Masala Dosa
INSERT INTO public.products (
    id, vendor_id, name, description, price, image_url, category, tags, 
    is_available, preparation_time, is_featured, is_bestseller
) VALUES (
    gen_random_uuid(), 
    'a1b2c3d4-e5f6-4a1b-9c8d-1234567890ab', 
    'Mysore Masala Dosa', 
    'Crispy crepe smeared with spicy red chutney and stuffed with potato masala', 
    120.00, 
    'https://images.unsplash.com/photo-1630384060421-cb20d0e06497?w=400&h=300&fit=crop', 
    'Breakfast', 
    '{Crispy,Spicy,Classic}', 
    true, 
    20, -- Integer value for minutes
    true, 
    true
);

-- Product 3: Filter Coffee
INSERT INTO public.products (
    id, vendor_id, name, description, price, image_url, category, tags, 
    is_available, preparation_time, is_featured, is_bestseller
) VALUES (
    gen_random_uuid(), 
    'a1b2c3d4-e5f6-4a1b-9c8d-1234567890ab', 
    'South Indian Filter Coffee', 
    'Strong and frothy coffee brewed with traditional stainless steel filter', 
    40.00, 
    'https://images.unsplash.com/photo-1596910547037-846b198031e5?w=400&h=300&fit=crop', 
    'Beverages', 
    '{Hot,Beverage,Traditional}', 
    true, 
    10, -- Integer value for minutes
    false, 
    true
);
