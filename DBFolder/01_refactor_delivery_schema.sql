-- Migration: Refactor Delivery Schema (Robust Version)
-- Description: Decouple delivery details from orders table. Safe to re-run.

BEGIN;

-- 1. Create 'deliveries' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    partner_id text NOT NULL CHECK (partner_id IN ('shadowfax')),
    external_order_id text, -- Shadowfax order_id
    status text, 
    rider_name text,
    rider_phone text,
    rider_coordinates jsonb,
    pickup_otp text,
    delivery_otp text,
    tracking_url text,
    meta_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Migrate existing data ONLY if 'orders' still has 'shadowfax_order_id'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shadowfax_order_id') THEN
        INSERT INTO public.deliveries (
            order_id, partner_id, external_order_id, status, rider_name, rider_phone, rider_coordinates, pickup_otp, delivery_otp
        )
        SELECT 
            id, 'shadowfax', shadowfax_order_id, COALESCE(delivery_status, 'UNKNOWN'), rider_name, rider_phone, rider_coordinates, pickup_otp, delivery_otp
        FROM public.orders
        WHERE shadowfax_order_id IS NOT NULL
        -- Avoid duplicates
        AND NOT EXISTS (SELECT 1 FROM public.deliveries WHERE deliveries.order_id = orders.id);
    END IF;
END $$;

-- 3. Drop redundant columns from 'orders' table (Safe Drop)
ALTER TABLE public.orders
    DROP COLUMN IF EXISTS shadowfax_order_id,
    DROP COLUMN IF EXISTS rider_name,
    DROP COLUMN IF EXISTS rider_phone,
    DROP COLUMN IF EXISTS rider_coordinates,
    DROP COLUMN IF EXISTS pickup_otp,
    DROP COLUMN IF EXISTS delivery_otp,
    DROP COLUMN IF EXISTS delivery_partner_details,
    DROP COLUMN IF EXISTS delivery_status;

-- 4. Drop 'riders' table
DROP TABLE IF EXISTS public.riders;

COMMIT;
