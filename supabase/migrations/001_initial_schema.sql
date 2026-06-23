-- FilmDate Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  couple_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Couples table
CREATE TABLE public.couples (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Add foreign key from users to couples
ALTER TABLE public.users
  ADD CONSTRAINT fk_couple
  FOREIGN KEY (couple_id) REFERENCES public.couples(id) ON DELETE SET NULL;

-- Themes table
CREATE TABLE public.themes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('情感', '观察', '创意', '生活', '特殊')),
  is_special BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily challenges table
CREATE TABLE public.daily_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge responses table
CREATE TABLE public.challenge_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  filter_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Collages table
CREATE TABLE public.collages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE,
  title TEXT,
  canvas_data JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Create indexes for better performance
CREATE INDEX idx_users_couple_id ON public.users(couple_id);
CREATE INDEX idx_daily_challenges_date ON public.daily_challenges(date);
CREATE INDEX idx_challenge_responses_challenge ON public.challenge_responses(challenge_id);
CREATE INDEX idx_challenge_responses_user ON public.challenge_responses(user_id);
CREATE INDEX idx_collages_couple ON public.collages(couple_id);
CREATE INDEX idx_achievements_user ON public.achievements(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Couples: Members can view their couple
CREATE POLICY "Couples viewable by members" ON public.couples
  FOR SELECT USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

CREATE POLICY "Users can create couples" ON public.couples
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Couples updatable by members" ON public.couples
  FOR UPDATE USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Themes: Everyone can view themes
CREATE POLICY "Themes viewable by everyone" ON public.themes
  FOR SELECT USING (true);

-- Daily challenges: Everyone can view challenges
CREATE POLICY "Challenges viewable by everyone" ON public.daily_challenges
  FOR SELECT USING (true);

CREATE POLICY "System can create challenges" ON public.daily_challenges
  FOR INSERT WITH CHECK (true);

-- Challenge responses: Users can view responses for challenges they participated in
CREATE POLICY "Responses viewable by participants" ON public.challenge_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.daily_challenges dc
      WHERE dc.id = challenge_id
    )
  );

CREATE POLICY "Users can insert own responses" ON public.challenge_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses" ON public.challenge_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Collages: Couple members can view and manage their collages
CREATE POLICY "Collages viewable by couple members" ON public.collages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can insert collages" ON public.collages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can update collages" ON public.collages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

CREATE POLICY "Couple members can delete collages" ON public.collages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.couples c
      WHERE c.id = couple_id
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- Achievements: Users can view their own achievements
CREATE POLICY "Achievements viewable by owner" ON public.achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_couples_updated_at
  BEFORE UPDATE ON public.couples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collages_updated_at
  BEFORE UPDATE ON public.collages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- Storage policies
CREATE POLICY "Photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Anyone can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Users can update own photos" ON storage.objects
  FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
