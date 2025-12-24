-- Remove username column from vendors table
-- Created by Antigravity on 2025-12-24

ALTER TABLE public.vendors DROP COLUMN IF EXISTS username;
