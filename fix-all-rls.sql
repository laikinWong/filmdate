-- COMPLETE RLS FIX for FilmDate
-- Copy and paste this ENTIRE script into Supabase SQL Editor and run it

-- ============================================
-- 1. COUPLES TABLE
-- ============================================

-- Drop ALL existing couples policies
DROP POLICY IF EXISTS "Couples viewable by members" ON public.couples;
DROP POLICY IF EXISTS "Couples viewable for invite code lookup" ON public.couples;
DROP POLICY IF EXISTS "Users can create couples" ON public.couples;
DROP POLICY IF EXISTS "Couples updatable by members" ON public.couples;

-- SELECT: allow all authenticated users (needed for invite code lookup)
CREATE POLICY "couples_select" ON public.couples
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT: only the creator
CREATE POLICY "couples_insert" ON public.couples
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

-- UPDATE: only members of the couple
CREATE POLICY "couples_update" ON public.couples
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- DELETE: allow deleting own incomplete couples (user2_id is null)
CREATE POLICY "couples_delete" ON public.couples
  FOR DELETE USING (auth.uid() = user1_id AND user2_id IS NULL);

-- ============================================
-- 2. USERS TABLE
-- ============================================

-- Drop ALL existing users policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view partner profile" ON public.users;

-- SELECT: own profile + partner's profile
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.couples c
      WHERE (c.user1_id = auth.uid() AND c.user2_id = id)
         OR (c.user2_id = auth.uid() AND c.user1_id = id)
    )
  );

-- INSERT: own profile only
CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: own profile only
CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 3. THEMES TABLE
-- ============================================

DROP POLICY IF EXISTS "Themes viewable by everyone" ON public.themes;
DROP POLICY IF EXISTS "themes_select" ON public.themes;

CREATE POLICY "themes_select" ON public.themes
  FOR SELECT USING (true);

-- ============================================
-- 4. DAILY CHALLENGES TABLE
-- ============================================

DROP POLICY IF EXISTS "Challenges viewable by everyone" ON public.daily_challenges;
DROP POLICY IF EXISTS "System can create challenges" ON public.daily_challenges;
DROP POLICY IF EXISTS "Anyone can create challenges" ON public.daily_challenges;
DROP POLICY IF EXISTS "challenges_select" ON public.daily_challenges;
DROP POLICY IF EXISTS "challenges_insert" ON public.daily_challenges;

CREATE POLICY "challenges_select" ON public.daily_challenges
  FOR SELECT USING (true);

CREATE POLICY "challenges_insert" ON public.daily_challenges
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 5. CHALLENGE RESPONSES TABLE
-- ============================================

DROP POLICY IF EXISTS "Responses viewable by participants" ON public.challenge_responses;
DROP POLICY IF EXISTS "Responses viewable by authenticated users" ON public.challenge_responses;
DROP POLICY IF EXISTS "Users can insert own responses" ON public.challenge_responses;
DROP POLICY IF EXISTS "Users can update own responses" ON public.challenge_responses;
DROP POLICY IF EXISTS "responses_select" ON public.challenge_responses;
DROP POLICY IF EXISTS "responses_insert" ON public.challenge_responses;
DROP POLICY IF EXISTS "responses_update" ON public.challenge_responses;

CREATE POLICY "responses_select" ON public.challenge_responses
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "responses_insert" ON public.challenge_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "responses_update" ON public.challenge_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 6. COLLAGES TABLE
-- ============================================

DROP POLICY IF EXISTS "Collages viewable by couple members" ON public.collages;
DROP POLICY IF EXISTS "Couple members can insert collages" ON public.collages;
DROP POLICY IF EXISTS "Couple members can update collages" ON public.collages;
DROP POLICY IF EXISTS "Couple members can delete collages" ON public.collages;
DROP POLICY IF EXISTS "collages_select" ON public.collages;
DROP POLICY IF EXISTS "collages_insert" ON public.collages;
DROP POLICY IF EXISTS "collages_update" ON public.collages;
DROP POLICY IF EXISTS "collages_delete" ON public.collages;

CREATE POLICY "collages_select" ON public.collages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "collages_insert" ON public.collages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "collages_update" ON public.collages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "collages_delete" ON public.collages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- ============================================
-- 7. ACHIEVEMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Achievements viewable by owner" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.achievements;
DROP POLICY IF EXISTS "achievements_select" ON public.achievements;
DROP POLICY IF EXISTS "achievements_insert" ON public.achievements;

CREATE POLICY "achievements_select" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "achievements_insert" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
