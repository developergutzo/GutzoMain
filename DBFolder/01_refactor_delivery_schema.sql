-- Migration: Refactor Delivery Schema
-- Description: Decouple delivery details from orders table, clean up redundant tables/columns.

BEGIN;

-- 1. Create 'deliveries' table
CREATE TABLE IF NOT EXISTS public.deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    partner_id text NOT NULL CHECK (partner_id IN ('shadowfax')),
    external_order_id text, -- Shadowfax order_id
    status text, -- ALLOTTED, ACCEPTED, etc.
    rider_name text,
    rider_phone text,
    rider_coordinates jsonb, -- { latitude: x, longitude: y }
    pickup_otp text,
    delivery_otp text,
    tracking_url text,
    meta_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Migrate existing data from 'orders' to 'deliveries'
-- Only migrate if shadowfax_order_id exists
INSERT INTO public.deliveries (
    order_id,
    partner_id,
    external_order_id,
    status,
    rider_name,
    rider_phone,
    rider_coordinates,
    pickup_otp,
    delivery_otp,
    created_at,
    updated_at
)
SELECT 
    id,
    'shadowfax',
    shadowfax_order_id,
    COALESCE(delivery_status, 'UNKNOWN'),
    rider_name,
    rider_phone,
    rider_coordinates,
    pickup_otp,
    delivery_otp,
    created_at,
    updated_at
FROM public.orders
WHERE shadowfax_order_id IS NOT NULL;

-- 3. Drop redundant columns from 'orders' table
-- NOTE: We are doing this in a transaction to ensure data safety.
ALTER TABLE public.orders
    DROP COLUMN IF EXISTS shadowfax_order_id,
    DROP COLUMN IF EXISTS rider_name,
    DROP COLUMN IF EXISTS rider_phone,
    DROP COLUMN IF EXISTS rider_coordinates,
    DROP COLUMN IF EXISTS pickup_otp,
    DROP COLUMN IF EXISTS delivery_otp,
    DROP COLUMN IF EXISTS delivery_partner_details,
    DROP COLUMN IF EXISTS delivery_status;

-- 4. Drop 'riders' table (Redundant internal fleet table)
DROP TABLE IF EXISTS public.riders;

-- 5. Add trigger for updated_at on deliveries (optional but good practice)
-- Assuming a generic update_updated_at_column function exists, otherwise skipping or creating inline.
-- (Skipping trigger creation to avoid dependency on specific helper functions not visible in snippet)

COMMIT;
