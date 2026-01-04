-- 1. Add fields for Raw Payload Storage (Audit)
ALTER TABLE public.deliveries 
ADD COLUMN IF NOT EXISTS courier_request_payload jsonb DEFAULT '{}'::jsonb, -- Stores OrderCreationRequest
ADD COLUMN IF NOT EXISTS courier_response_payload jsonb DEFAULT '{}'::jsonb; -- Stores OrderCallbackRequest

-- 2. Add history for timeline tracking
ALTER TABLE public.deliveries 
ADD COLUMN IF NOT EXISTS history jsonb DEFAULT '[]'::jsonb;

-- 3. Add specific attributes from OrderCallbackRequest
ALTER TABLE public.deliveries
ADD COLUMN IF NOT EXISTS rider_id text,
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS cancelled_by text;

-- 4. Comment on columns for documentation
COMMENT ON COLUMN public.deliveries.courier_request_payload IS 'Full OrderCreationRequest sent to Shadowfax';
COMMENT ON COLUMN public.deliveries.courier_response_payload IS 'Latest OrderCallbackRequest received via Webhook';
COMMENT ON COLUMN public.deliveries.rider_id IS 'Unique Rider ID from Shadowfax';
