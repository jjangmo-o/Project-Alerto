-- Migration: Add pending_profile_changes column to profiles table
-- This column stores pending profile edits as JSON until admin approval
-- When admin rejects, this data is cleared without being applied to the profile

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pending_profile_changes JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.pending_profile_changes IS 
  'Stores pending profile changes (address, contact_number, email, profile_image_url) as JSON. Applied to profile on admin approval, cleared on rejection.';
