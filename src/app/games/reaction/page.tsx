'use client'

import { Suspense } from 'react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { getCurrentUser } from '@/lib/auth'
import { getGameByRoomCode, createGame, joinGame, subscribeToGame, updateGameState, finishGame } from '@/lib/games'

type Phase = 'waiting' | 'countdown' | 'waitingGreen' | 'go' | 'clicked' | 'tooEarly' | 'roundResult' | 'gameOver'

export default function ReactionGamePageWrapper() {
  return (
    <Suspense fallback={<Layout><div className="min-h-screen flex items-center justify-center">加载中...</div></Layout>}>
      <ReactionGamePage />
    </Suspense>
  )
}

function ReactionGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')

  const [user, setUser] = useState<any>(null)
  const [game, setGame] = useState<any>(null)
  const [phase, setPhase] = useState<Phase>('waiting')
  const [round, setRound] = useState(1)
  const [scores, setScores] = useState([0, 0])
  const [myReactionTime, setMyReactionTime] = useState<number | null>(null)
  const [opponentReactionTime, setOpponentReactionTime] = useState<number | null>(null)
  const [isMyTurn, setIsMyTurn] = useState(true)
  const [winner, setWinner] = useState<string | null>(null)
  const [roomInput, setRoomInput] = useState('')

  const startTimeRef = useRef(0)
  const timeoutRef = useRef<any>(null)
  const subRef = useRef<any>(null)

  const isPlayer1 = game?.player1_id === user?.id
  const myIndex = isPlayer1 ? 0 : 1
  const opponentIndex = isPlayer1 ? 1 : 0

  useEffect(() => {
    init()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (subRef.current) subRef.current.unsubscribe()
    }
  }, [])

  const init = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) { router.push('/auth/login'); return }
    setUser(currentUser)

    if (roomCode) {
      const existingGame = await getGameByRoomCode(roomCode)
      if (existingGame) {
        if (!existingGame.player2_id && existingGame.player1_id !== currentUser.id) {
          const joined = await joinGame(currentUser.id, roomCode)
          setGame(joined)
        } else {
          setGame(existingGame)
        }
        subscribe(existingGame.id)
      }
    }
  }

  const subscribe = useCallback((gameId: string) => {
    subRef.current = subscribeToGame(gameId, (payload) => {
      if (payload.new) {
        setGame(payload.new)
        const state = payload.new.game_state
        if (state) {
          setScores(state.scores || [0, 0])
          setRound(state.round || 1)
        }
      }
    })
  }, [])

  const handleCreateRoom = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) { router.push('/auth/login'); return }
    const newGame = await createGame(currentUser.id, 'reaction')
    setGame(newGame)
    subscribe(newGame.id)
    window.history.replaceState(null, '', `/games/reaction?room=${newGame.room_code}`)
  }

  const handleJoinRoom = async () => {
    if (roomInput.length !== 6) return
    const currentUser = await getCurrentUser()
    if (!currentUser) { router.push('/auth/login'); return }
    try {
      const joined = await joinGame(currentUser.id, roomInput)
      setGame(joined)
      subscribe(joined.id)
      window.history.replaceState(null, '', `/games/reaction?room=${joined.room_code}`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  const startRound = () => {
    setPhase('countdown')
    setMyReactionTime(null)
    setOpponentReactionTime(null)

    timeoutRef.current = setTimeout(() => {
      setPhase('waitingGreen')
      const delay = 2000 + Math.random() * 4000
      timeoutRef.current = setTimeout(() => {
        setPhase('go')
        startTimeRef.current = Date.now()
      }, delay)
    }, 1000)
  }

  const handleClick = () => {
    if (phase === 'waitingGreen') {
      // Too early!
      setPhase('tooEarly')
      const newScores = [...scores]
      newScores[opponentIndex]++
      setScores(newScores)
      if (game) {
        updateGameState(game.id, { ...game.game_state, scores: newScores, round: round + 1 })
      }
      setTimeout(() => {
        if (round >= 5) {
          endGame(newScores)
        } else {
          setRound(r => r + 1)
          setPhase('roundResult')
        }
      }, 1500)
      return
    }

    if (phase === 'go') {
      const time = Date.now() - startTimeRef.current
      setMyReactionTime(time)
      setPhase('clicked')

      // Simulate opponent (for now, just proceed)
      setTimeout(() => {
        const oppTime = Math.floor(Math.random() * 400) + 150
        setOpponentReactionTime(oppTime)

        const newScores = [...scores]
        if (time < oppTime) {
          newScores[myIndex]++
        } else {
          newScores[opponentIndex]++
        }
        setScores(newScores)

        if (game) {
          updateGameState(game.id, { ...game.game_state, scores: newScores, round: round + 1 })
        }

        setTimeout(() => {
          if (round >= 5) {
            endGame(newScores)
          } else {
            setRound(r => r + 1)
            setPhase('roundResult')
          }
        }, 2000)
      }, 500)
    }
  }

  const endGame = (finalScores: number[]) => {
    setPhase('gameOver')
    if (finalScores[myIndex] > finalScores[opponentIndex]) {
      setWinner(user?.name || '你')
    } else if (finalScores[opponentIndex] > finalScores[myIndex]) {
      setWinner('对方')
    } else {
      setWinner('平局')
    }
    if (game) {
      const winnerId = finalScores[myIndex] > finalScores[opponentIndex] ? user?.id : game.player1_id === user?.id ? game.player2_id : game.player1_id
      if (winnerId) finishGame(game.id, winnerId)
    }
  }

  const getBackgroundColor = () => {
    switch (phase) {
      case 'waitingGreen': return 'bg-red-500'
      case 'go': return 'bg-green-500'
      case 'tooEarly': return 'bg-yellow-500'
      default: return 'bg-primary-dark/5'
    }
  }

  const getMessage = () => {
    switch (phase) {
      case 'waiting': return roomCode ? '等待对手加入...' : '创建房间或输入房间号'
      case 'countdown': return '准备...'
      case 'waitingGreen': return '等待变绿...'
      case 'go': return '点击!'
      case 'clicked': return `${myReactionTime}ms`
      case 'tooEarly': return '太早了! 对手得分'
      case 'roundResult': return `第 ${round} / 5 局`
      case 'gameOver': return winner === '平局' ? '平局!' : `${winner} 获胜!`
      default: return ''
    }
  }

  // No game yet - show room setup
  if (!game) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <h1 className="text-4xl font-handwritten text-primary-dark mb-2">⚡ 反应速度PK</h1>
            <p className="text-primary-dark/60 mb-8">创建房间或输入对方的房间号</p>
            <button onClick={handleCreateRoom} className="w-full p-4 bg-primary-dark text-primary-light rounded-xl mb-6 font-handwritten text-lg hover:bg-primary-dark/90">
              创建房间
            </button>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary-dark/10" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-4 bg-primary-light text-primary-dark/40">或者</span></div>
            </div>
            <div className="flex gap-3 justify-center">
              <input type="text" placeholder="房间号" value={roomInput} onChange={e => setRoomInput(e.target.value.toUpperCase())} maxLength={6}
                className="w-40 p-3 text-center text-xl font-mono tracking-widest bg-primary-light border-2 border-primary-dark/20 rounded-lg focus:border-accent-gold focus:outline-none" />
              <button onClick={handleJoinRoom} disabled={roomInput.length !== 6}
                className="px-6 bg-primary-dark text-primary-light rounded-lg disabled:opacity-50">加入</button>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        {/* Room info */}
        <div className="text-center mb-4">
          <p className="text-sm text-primary-dark/40">房间号: {game.room_code}</p>
          <p className="text-sm text-primary-dark/40">第 {round} / 5 局</p>
        </div>

        {/* Scores */}
        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <p className="text-sm text-primary-dark/60">{isMyTurn ? '你' : '对方'}</p>
            <p className="text-3xl font-handwritten text-accent-gold">{scores[myIndex]}</p>
          </div>
          <div className="text-2xl text-primary-dark/20">VS</div>
          <div className="text-center">
            <p className="text-sm text-primary-dark/60">{isMyTurn ? '对方' : '你'}</p>
            <p className="text-3xl font-handwritten text-accent-neon">{scores[opponentIndex]}</p>
          </div>
        </div>

        {/* Game area */}
        <div className={`w-full max-w-md aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${getBackgroundColor()}`}
          onClick={handleClick}
        >
          <p className="text-4xl font-handwritten text-white mb-4">{getMessage()}</p>
          {myReactionTime && <p className="text-6xl font-mono text-white">{myReactionTime}ms</p>}
          {opponentReactionTime && phase === 'roundResult' && (
            <p className="text-lg text-white/80 mt-2">对方: {opponentReactionTime}ms</p>
          )}
        </div>

        {/* Start button */}
        {(phase === 'waiting' && game.player2_id) && (
          <button onClick={startRound} className="mt-6 px-8 py-3 bg-accent-gold text-primary-dark rounded-xl font-handwritten text-lg">
            开始第 {round} 局
          </button>
        )}

        {(phase === 'roundResult' && round <= 5) && (
          <button onClick={startRound} className="mt-6 px-8 py-3 bg-accent-gold text-primary-dark rounded-xl font-handwritten text-lg">
            下一局
          </button>
        )}

        {phase === 'gameOver' && (
          <button onClick={() => router.push('/games')} className="mt-6 px-8 py-3 bg-primary-dark text-primary-light rounded-xl font-handwritten text-lg">
            返回游戏厅
          </button>
        )}
      </div>
    </Layout>
  )
}
