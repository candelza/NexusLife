-- Add line_id column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS line_id TEXT;
