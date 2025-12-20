-- 1. Add columns to vendors table
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS longitude double precision;

-- 2. Update existing vendors with coordinates (Coimbatore)

-- The Fruit Bowl Co (RS Puram)
UPDATE public.vendors 
SET latitude = 11.001811, longitude = 76.962845 
WHERE name = 'The Fruit Bowl Co';

-- Green Leaf Salads (Gandhipuram)
UPDATE public.vendors 
SET latitude = 11.0168, longitude = 76.9558 
WHERE name = 'Green Leaf Salads';

-- Smoothie Haven (Peelamedu)
UPDATE public.vendors 
SET latitude = 11.0200, longitude = 76.9900 
WHERE name = 'Smoothie Haven';

-- Wholesome Kitchen (Saibaba Colony)
UPDATE public.vendors 
SET latitude = 11.0267, longitude = 76.9452 
WHERE name = 'Wholesome Kitchen';

-- Pure Greens Cafe (Race Course)
UPDATE public.vendors 
SET latitude = 11.0025, longitude = 76.9740 
WHERE name = 'Pure Greens Cafe';

-- Nutri Bowl Express (Singanallur)
UPDATE public.vendors 
SET latitude = 10.9984, longitude = 76.9996 
WHERE name = 'Nutri Bowl Express';

-- Detox & Delight (Vadavalli)
UPDATE public.vendors 
SET latitude = 11.0125, longitude = 76.9015 
WHERE name = 'Detox & Delight';

-- Protein Power House (Hopes College)
UPDATE public.vendors 
SET latitude = 11.0260, longitude = 77.0120 
WHERE name = 'Protein Power House';
