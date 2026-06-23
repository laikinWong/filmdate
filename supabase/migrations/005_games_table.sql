CREATE TABLE public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reaction', 'memory', 'knowledge')),
  player1_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  player2_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  winner_id UUID REFERENCES public.users(id),
  game_state JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_games_room_code ON public.games(room_code);
CREATE INDEX idx_games_player1 ON public.games(player1_id);
CREATE INDEX idx_games_player2 ON public.games(player2_id);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "games_select" ON public.games FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "games_insert" ON public.games FOR INSERT WITH CHECK (auth.uid() = player1_id);
CREATE POLICY "games_update" ON public.games FOR UPDATE USING (true);

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
