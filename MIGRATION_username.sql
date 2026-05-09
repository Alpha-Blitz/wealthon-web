-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- Adds username column to partners table for username-based login

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS username text UNIQUE;

CREATE INDEX IF NOT EXISTS partners_username_idx ON public.partners (username);
