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
      if (!user) {
        router.push('/auth/login')
        return
      }
      const game = await createGame(user.id, type)
      router.push(`/games/${game.type}?room=${game.room_code}`)
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
      if (!user) {
        router.push('/auth/login')
        return
      }
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
          <h1 className="text-4xl font-handwritten text-primary-dark mb-2">
            情侣PK游戏厅
          </h1>
          <p className="text-primary-dark/60">
            选择游戏，邀请对方来PK
          </p>
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
              <span className="px-4 bg-primary-light text-primary-dark/40">
                或者加入对方的房间
              </span>
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
