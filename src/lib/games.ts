import { createBrowserClient } from './supabase-browser'
import type { RealtimePostgresChangesPayload } from '@supabase/realtime-js'

export type GameType = 'reaction' | 'memory' | 'knowledge'

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createGame(userId: string, type: GameType) {
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

export async function getGameByRoomCode(roomCode: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateGameState(gameId: string, state: Record<string, unknown>) {
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

export function subscribeToGame(
  gameId: string,
  callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
) {
  const supabase = createBrowserClient()
  return supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, callback)
    .subscribe()
}

function getDefaultGameState(type: GameType) {
  switch (type) {
    case 'reaction':
      return { round: 1, scores: [0, 0], phase: 'waiting', playerReady: {} }
    case 'memory':
      return { board: [], flipped: [], matched: [], currentTurn: 'player1', scores: [0, 0] }
    case 'knowledge':
      return { currentQuestion: 0, answers: { player1: '', player2: '' }, scores: [0, 0], phase: 'answering' }
    default:
      return {}
  }
}
