-- Fix RLS policies for daily_challenges and themes tables
-- Run this in Supabase SQL Editor

-- Allow anyone to insert daily challenges
DROP POLICY IF EXISTS "System can create challenges" ON public.daily_challenges;
CREATE POLICY "Anyone can create challenges" ON public.daily_challenges
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read themes (already done, but let's make sure)
DROP POLICY IF EXISTS "Themes viewable by everyone" ON public.themes;
CREATE POLICY "Themes viewable by everyone" ON public.themes
  FOR SELECT USING (true);

-- Allow anyone to read daily challenges (already done, but let's make sure)
DROP POLICY IF EXISTS "Challenges viewable by everyone" ON public.daily_challenges;
CREATE POLICY "Challenges viewable by everyone" ON public.daily_challenges
  FOR SELECT USING (true);
