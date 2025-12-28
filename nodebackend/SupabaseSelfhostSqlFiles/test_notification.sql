-- Test SQL to trigger Realtime Notification
-- This will insert a fake order into the database.
-- It dynamically picks the first user and first vendor found in the database.

INSERT INTO public.orders (
    user_id,
    vendor_id,
    order_number,
    status,
    order_type,
    subtotal,
    total_amount,
    delivery_address,
    payment_status,
    created_at
)
SELECT
    (SELECT id FROM public.users LIMIT 1),           -- Picks the first user
    (SELECT id FROM public.vendors WHERE name ILIKE '%Pitchammal%' LIMIT 1), -- Picks "Pitchammal's kitchen"
    'TEST-' || floor(random() * 1000000)::text,       -- Random Order ID
    'placed',
    'instant',
    100.00,
    150.00,
    '{"address": "123 Test St", "city": "Test City"}'::jsonb, -- Mock Address
    'paid',                                           -- Status that triggers dashboard
    now()
RETURNING id, order_number, status, vendor_id;
