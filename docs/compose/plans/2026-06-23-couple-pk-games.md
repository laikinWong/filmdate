# Couple PK Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 interactive PK mini-games for couples: Reaction Speed, Memory, and Knowledge.

**Architecture:** Supabase Realtime for real-time game sync. New `games` table for game state. 3 new game pages + lobby page.

**Tech Stack:** Next.js, Supabase Realtime, Canvas API (for animations)

---

## Phase 1: Database & Game Infrastructure

### Task 1: Database Schema for Games

**Covers:** S7

**Files:**
- Create: `supabase/migrations/005_games_table.sql`

- [ ] **Step 1: Create games migration**

```sql
-- Games table
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
CREATE POLICY "games_update" ON public.games FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

- [ ] **Step 2: Run migration in Supabase**

- [ ] **Step 3: Commit**

---

### Task 2: Game Utility Functions

**Covers:** S6

**Files:**
- Create: `src/lib/games.ts`

- [ ] **Step 1: Create game utility functions**

```typescript
import { createBrowserClient } from './supabase-browser'

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createGame(userId: string, type: 'reaction' | 'memory' | 'knowledge') {
  const supabase = createBrowserClient()
  const roomCode = generateRoomCode()

  const { data, error } = await supabase
    .from('games')
    .insert({
      room_code: roomCode,
      type,
      player1_id: userId,
      status: 'waiting',
      game_state: getDefaultGameState(type),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function joinGame(userId: string, roomCode: string) {
  const supabase = createBrowserClient()

  const { data: game, error: findError } = await supabase
    .from('games')
    .select()
    .eq('room_code', roomCode.toUpperCase())
    .maybeSingle()

  if (findError || !game) throw new Error('房间不存在')
  if (game.player2_id) throw new Error('房间已满')
  if (game.player1_id === userId) throw new Error('不能加入自己创建的房间')

  const { data, error } = await supabase
    .from('games')
    .update({ player2_id: userId, status: 'playing' })
    .eq('id', game.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGameState(gameId: string, state: any) {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from('games')
    .update({ game_state: state })
    .eq('id', gameId)

  if (error) throw error
}

export async function finishGame(gameId: string, winnerId: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from('games')
    .update({ status: 'finished', winner_id: winnerId })
    .eq('id', gameId)

  if (error) throw error
}

export async function getGame(gameId: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('games')
    .select('*, player1:users!player1_id(*), player2:users!player2_id(*)')
    .eq('id', gameId)
    .single()

  if (error) throw error
  return data
}

export function subscribeToGame(gameId: string, callback: (payload: any) => void) {
  const supabase = createBrowserClient()
  return supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, callback)
    .subscribe()
}

function getDefaultGameState(type: string) {
  switch (type) {
    case 'reaction':
      return { round: 1, scores: [0, 0], currentRound: 'waiting' }
    case 'memory':
      return { board: [], flipped: [], matched: [], currentTurn: 'player1', scores: [0, 0] }
    case 'knowledge':
      return { questions: [], answers: { player1: [], player2: [] }, currentQuestion: 0, scores: [0, 0] }
    default:
      return {}
  }
}
```

- [ ] **Step 2: Commit**

---

## Phase 2: Game Lobby

### Task 3: Games Lobby Page

**Covers:** S8

**Files:**
- Create: `src/app/games/page.tsx`
- Create: `src/components/GameCard.tsx`

- [ ] **Step 1: Create GameCard component**

```typescript
'use client'

interface GameCardProps {
  title: string
  icon: string
  description: string
  type: 'reaction' | 'memory' | 'knowledge'
  onPlay: (type: 'reaction' | 'memory' | 'knowledge') => void
}

export default function GameCard({ title, icon, description, type, onPlay }: GameCardProps) {
  return (
    <div className="bg-primary-dark/5 rounded-xl p-6 border border-primary-dark/10 hover:border-accent-gold transition-all cursor-pointer group"
      onClick={() => onPlay(type)}
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-handwritten text-primary-dark mb-2">{title}</h3>
      <p className="text-sm text-primary-dark/60">{description}</p>
    </div>
  )
}
```

- [ ] **Step 2: Create games lobby page**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import GameCard from '@/components/GameCard'
import { createGame, joinGame } from '@/lib/games'
import { getCurrentUser } from '@/lib/auth'

export default function GamesPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [error, setError] = useState('')

  const games = [
    { type: 'reaction' as const, title: '反应速度PK', icon: '⚡', description: '比比谁的反应更快，5局3胜' },
    { type: 'memory' as const, title: '记忆力PK', icon: '🧠', description: '翻牌配对，看谁记得更多' },
    { type: 'knowledge' as const, title: '了解度PK', icon: '💕', description: '回答关于对方的问题，看谁更懂' },
  ]

  const handleCreateGame = async (type: 'reaction' | 'memory' | 'knowledge') => {
    try {
      const user = await getCurrentUser()
      if (!user) { router.push('/auth/login'); return }
      const game = await createGame(user.id, type)
      router.push(`/games/${type}?room=${game.room_code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    }
  }

  const handleJoinGame = async () => {
    if (roomCode.length !== 6) return
    setJoinLoading(true)
    setError('')
    try {
      const user = await getCurrentUser()
      if (!user) { router.push('/auth/login'); return }
      const game = await joinGame(user.id, roomCode)
      router.push(`/games/${game.type}?room=${game.room_code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加入失败')
    } finally {
      setJoinLoading(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-handwritten text-primary-dark mb-2">情侣PK游戏厅</h1>
          <p className="text-primary-dark/60">选择游戏，邀请对方来PK</p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-4 p-3 bg-accent-red/10 rounded-lg text-center">
            <p className="text-accent-red text-sm">{error}</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {games.map(game => (
            <GameCard key={game.type} {...game} onPlay={handleCreateGame} />
          ))}
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary-dark/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-primary-light text-primary-dark/40">或者加入对方的房间</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center mt-4">
            <input
              type="text"
              placeholder="输入房间号"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-48 p-3 text-center text-xl font-mono tracking-widest bg-primary-light border-2 border-primary-dark/20 rounded-lg focus:border-accent-gold focus:outline-none"
            />
            <button
              onClick={handleJoinGame}
              disabled={roomCode.length !== 6 || joinLoading}
              className="px-6 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 disabled:opacity-50 font-medium"
            >
              {joinLoading ? '...' : '加入'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
```

- [ ] **Step 3: Update Navigation to include Games tab**

- [ ] **Step 4: Commit**

---

## Phase 3: Reaction Speed PK

### Task 4: Reaction Speed Game

**Covers:** S3

**Files:**
- Create: `src/app/games/reaction/page.tsx`

- [ ] **Step 1: Create reaction speed game page**

```typescript
'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { getCurrentUser } from '@/lib/auth'
import { createGame, joinGame, getGame, subscribeToGame, updateGameState, finishGame } from '@/lib/games'

type GameState = 'waiting' | 'ready' | 'go' | 'clicked' | 'result' | 'finished'

export default function ReactionGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')
  
  const [user, setUser] = useState<any>(null)
  const [game, setGame] = useState<any>(null)
  const [gameState, setGameState] = useState<GameState>('waiting')
  const [scores, setScores] = useState([0, 0])
  const [round, setRound] = useState(1)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState(0)
  const [earlyClick, setEarlyClick] = useState(false)
  const [opponentClicked, setOpponentClicked] = useState(false)
  const timeoutRef = useRef<any>(null)

  useEffect(() => {
    initGame()
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  const initGame = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) { router.push('/auth/login'); return }
    setUser(currentUser)

    if (!roomCode) return

    // Try to find existing game
    // ... (join or create logic)
    
    // Subscribe to game updates
    // ... (realtime subscription)
  }

  const startRound = () => {
    setGameState('ready')
    setEarlyClick(false)
    setReactionTime(null)
    setOpponentClicked(false)
    
    const delay = 2000 + Math.random() * 4000
    timeoutRef.current = setTimeout(() => {
      setGameState('go')
      setStartTime(Date.now())
    }, delay)
  }

  const handleClick = () => {
    if (gameState === 'waiting' || gameState === 'result' || gameState === 'finished') return
    
    if (gameState === 'ready') {
      // Clicked too early
      setEarlyClick(true)
      setGameState('result')
      // Opponent wins this round
      return
    }

    if (gameState === 'go') {
      const time = Date.now() - startTime
      setReactionTime(time)
      setGameState('clicked')
      // Wait for opponent or timeout
    }
  }

  // ... render logic
}
```

- [ ] **Step 2: Complete the reaction game implementation**

- [ ] **Step 3: Commit**

---

## Phase 4: Memory PK

### Task 5: Memory Game

**Covers:** S4

**Files:**
- Create: `src/app/games/memory/page.tsx`

- [ ] **Step 1: Create memory game page**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { getCurrentUser } from '@/lib/auth'

const EMOJIS = ['🎬', '📸', '🎨', '🎵', '🌸', '🌙', '⭐', '🔥']

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

export default function MemoryGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')

  const [user, setUser] = useState<any>(null)
  const [board, setBoard] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1')
  const [scores, setScores] = useState([0, 0])
  const [isMyTurn, setIsMyTurn] = useState(true)

  useEffect(() => {
    initBoard()
  }, [])

  const initBoard = () => {
    const pairs = [...EMOJIS, ...EMOJIS]
    const shuffled = pairs.sort(() => Math.random() - 0.5)
    const cards = shuffled.map((emoji, i) => ({
      id: i,
      emoji,
      isFlipped: false,
      isMatched: false,
    }))
    setBoard(cards)
  }

  const handleCardClick = (index: number) => {
    if (!isMyTurn || board[index].isFlipped || board[index].isMatched) return
    if (flippedIndices.length >= 2) return

    const newBoard = [...board]
    newBoard[index].isFlipped = true
    setBoard(newBoard)
    setFlippedIndices([...flippedIndices, index])

    if (flippedIndices.length === 1) {
      // Check for match
      const firstIndex = flippedIndices[0]
      if (newBoard[firstIndex].emoji === newBoard[index].emoji) {
        // Match!
        newBoard[firstIndex].isMatched = true
        newBoard[index].isMatched = true
        setBoard(newBoard)
        // Update score and go again
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          newBoard[firstIndex].isFlipped = false
          newBoard[index].isFlipped = false
          setBoard(newBoard)
          setFlippedIndices([])
          // Switch turns
        }, 1000)
      }
    }
  }

  // ... render logic with 4x4 grid
}
```

- [ ] **Step 2: Complete the memory game implementation**

- [ ] **Step 3: Commit**

---

## Phase 5: Knowledge PK

### Task 6: Knowledge Game

**Covers:** S5

**Files:**
- Create: `src/app/games/knowledge/page.tsx`

- [ ] **Step 1: Create knowledge game page**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { getCurrentUser } from '@/lib/auth'

const QUESTIONS = [
  '对方最喜欢的食物是什么？',
  '对方最害怕什么？',
  '对方最喜欢的电影/电视剧是？',
  '对方最想去的地方是？',
  '对方的生日是几月几号？',
  '对方最喜欢的季节是？',
  '对方小时候的梦想是什么？',
  '对方最常说的话是什么？',
]

export default function KnowledgeGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')

  const [user, setUser] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [myAnswer, setMyAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [opponentAnswer, setOpponentAnswer] = useState('')
  const [scores, setScores] = useState([0, 0])
  const [phase, setPhase] = useState<'answering' | 'revealing' | 'finished'>('answering')

  const handleSubmit = async () => {
    if (!myAnswer.trim()) return
    setSubmitted(true)
    // Send answer to game state
    // Wait for opponent
  }

  const checkAnswers = () => {
    // Compare answers (simple string match or fuzzy match)
    const match = myAnswer.trim().toLowerCase() === opponentAnswer.trim().toLowerCase()
    if (match) {
      // Update score
    }
    // Move to next question
  }

  // ... render logic
}
```

- [ ] **Step 2: Complete the knowledge game implementation**

- [ ] **Step 3: Commit**

---

## Phase 6: Integration & Polish

### Task 7: Add Games to Navigation

**Covers:** S8

**Files:**
- Modify: `src/components/Navigation.tsx`

- [ ] **Step 1: Add Games tab to navigation**

```typescript
const navItems = [
  { href: '/', label: '回忆墙', icon: '📸' },
  { href: '/challenge', label: '今日挑战', icon: '🎬' },
  { href: '/games', label: 'PK', icon: '🎮' },
  { href: '/editor', label: '拼贴', icon: '🎨' },
  { href: '/achievements', label: '成就', icon: '🏆' },
]
```

- [ ] **Step 2: Commit**

---

### Task 8: Testing & Deployment

- [ ] **Step 1: Build and test locally**

```bash
npm run build
```

- [ ] **Step 2: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 3: Deploy to Vercel**

---

## Self-Review

**Spec Coverage:**
- [x] S3: Reaction Speed PK - Task 4
- [x] S4: Memory PK - Task 5
- [x] S5: Knowledge PK - Task 6
- [x] S6: Technical Architecture - Tasks 1-2
- [x] S7: Data Model - Task 1
- [x] S8: UI Design - Tasks 3, 7
