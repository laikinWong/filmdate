-- Fix RLS policy for couples table to allow invite code lookup
-- Run this in Supabase SQL Editor

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Couples viewable by members" ON public.couples;

-- Create a new policy that allows anyone to read couples (for invite code lookup)
CREATE POLICY "Couples viewable for invite code lookup" ON public.couples
  FOR SELECT USING (true);

-- Note: This allows all authenticated users to read couples table
-- In a production app, you might want more restrictive policies
