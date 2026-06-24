export interface UserProfile {
  id: string
  name?: string | null
  email?: string | null
  avatar_url?: string | null
  couple_id?: string | null
}

export interface Couple {
  id: string
  user1_id: string
  user2_id?: string | null
  invite_code?: string | null
}

export interface Theme {
  content: string
  category: string
}

export interface DailyChallenge {
  id: string
  themes: Theme
}

export interface ChallengeResponse {
  id: string
  user_id: string
  photo_url: string
  caption?: string | null
  created_at: string
  users?: {
    name: string
    avatar_url?: string | null
  } | null
  daily_challenges?: {
    themes?: Theme | null
  } | null
}

export interface GameRecord<TState extends Record<string, unknown> = Record<string, unknown>> {
  id: string
  room_code: string
  player1_id: string
  player2_id?: string | null
  game_state?: TState | null
}
