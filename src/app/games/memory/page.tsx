'use client'

import { Suspense } from 'react'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { getCurrentUser } from '@/lib/auth'
import { getGameByRoomCode, createGame, joinGame, updateGameState, finishGame } from '@/lib/games'
import type { GameRecord, UserProfile } from '@/lib/types'

const EMOJIS = ['🎬', '📸', '🎨', '🎵', '🌸', '🌙', '⭐', '🔥']

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

type MemoryGameState = Record<string, unknown> & {
  board?: Card[]
  scores?: number[]
  currentTurn?: 'player1' | 'player2'
}

type MemoryGame = GameRecord<MemoryGameState>

export default function MemoryGamePageWrapper() {
  return (
    <Suspense fallback={<Layout><div className="min-h-screen flex items-center justify-center">加载中...</div></Layout>}>
      <MemoryGamePage />
    </Suspense>
  )
}

function MemoryGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')

  const [user, setUser] = useState<UserProfile | null>(null)
  const [game, setGame] = useState<MemoryGame | null>(null)
  const [board, setBoard] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [scores, setScores] = useState([0, 0])
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1')
  const [roomInput, setRoomInput] = useState('')
  const [gameOver, setGameOver] = useState(false)

  const isPlayer1 = game?.player1_id === user?.id
  const isMyTurn = (currentTurn === 'player1' && isPlayer1) || (currentTurn === 'player2' && !isPlayer1)
  const myIndex = isPlayer1 ? 0 : 1

  const initBoard = useCallback((gameData: MemoryGame) => {
    const pairs = [...EMOJIS, ...EMOJIS]
    const shuffled = pairs.sort(() => Math.random() - 0.5)
    const cards = shuffled.map((emoji, i) => ({
      id: i,
      emoji,
      isFlipped: false,
      isMatched: false,
    }))
    setBoard(cards)
    if (gameData) {
      updateGameState(gameData.id, { board: cards, scores: [0, 0], currentTurn: 'player1' })
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) { router.push('/auth/login'); return }
      setUser(currentUser)

      if (roomCode) {
        const existingGame = await getGameByRoomCode(roomCode) as MemoryGame | null
        if (existingGame) {
          if (!existingGame.player2_id && existingGame.player1_id !== currentUser.id) {
            const joined = await joinGame(currentUser.id, roomCode) as MemoryGame
            setGame(joined)
            initBoard(joined)
          } else {
            setGame(existingGame)
            if (existingGame.game_state?.board?.length) {
              setBoard(existingGame.game_state.board)
              setScores(existingGame.game_state.scores || [0, 0])
              setCurrentTurn(existingGame.game_state.currentTurn || 'player1')
            } else {
              initBoard(existingGame)
            }
          }
        }
      }
    }

    init()
  }, [initBoard, roomCode, router])

  const handleCardClick = (index: number) => {
    if (!isMyTurn || !game) return
    if (board[index].isFlipped || board[index].isMatched) return
    if (flippedIndices.length >= 2) return

    const newBoard = board.map((card, cardIndex) => (
      cardIndex === index ? { ...card, isFlipped: true } : card
    ))
    setBoard(newBoard)
    const newFlipped = [...flippedIndices, index]
    setFlippedIndices(newFlipped)

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped
      if (newBoard[first].emoji === newBoard[second].emoji) {
        const matchedBoard = newBoard.map((card, cardIndex) => (
          cardIndex === first || cardIndex === second ? { ...card, isMatched: true } : card
        ))
        const newScores = [...scores]
        newScores[myIndex]++
        setScores(newScores)
        setBoard(matchedBoard)
        setFlippedIndices([])

        const totalMatched = matchedBoard.filter(c => c.isMatched).length
        if (totalMatched === matchedBoard.length) {
          setGameOver(true)
          const winnerId = newScores[0] > newScores[1] ? game.player1_id : game.player2_id
          if (winnerId) finishGame(game.id, winnerId)
        }

        updateGameState(game.id, { board: matchedBoard, scores: newScores, currentTurn })
      } else {
        setTimeout(() => {
          const resetBoard = newBoard.map((card, cardIndex) => (
            cardIndex === first || cardIndex === second ? { ...card, isFlipped: false } : card
          ))
          setBoard(resetBoard)
          setFlippedIndices([])
          const nextTurn = currentTurn === 'player1' ? 'player2' : 'player1'
          setCurrentTurn(nextTurn)
          updateGameState(game.id, { board: resetBoard, scores, currentTurn: nextTurn })
        }, 1000)
      }
    }
  }

  const handleCreateRoom = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) { router.push('/auth/login'); return }
    const newGame = await createGame(currentUser.id, 'memory') as MemoryGame
    setGame(newGame)
    initBoard(newGame)
    window.history.replaceState(null, '', `/games/memory?room=${newGame.room_code}`)
  }

  const handleJoinRoom = async () => {
    if (roomInput.length !== 6) return
    const currentUser = await getCurrentUser()
    if (!currentUser) { router.push('/auth/login'); return }
    try {
      const joined = await joinGame(currentUser.id, roomInput) as MemoryGame
      setGame(joined)
      initBoard(joined)
      window.history.replaceState(null, '', `/games/memory?room=${joined.room_code}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : '加入失败')
    }
  }

  // No game yet
  if (!game) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <h1 className="text-4xl font-handwritten text-primary-dark mb-2">🧠 记忆力PK</h1>
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-4">
          <p className="text-sm text-primary-dark/40">房间号: {game.room_code}</p>
        </div>

        {/* Scores */}
        <div className="flex gap-8 mb-6">
          <div className={`text-center px-4 py-2 rounded-lg ${isMyTurn && !gameOver ? 'bg-accent-gold/20 border border-accent-gold' : ''}`}>
            <p className="text-sm text-primary-dark/60">你</p>
            <p className="text-2xl font-handwritten text-accent-gold">{scores[myIndex]}</p>
          </div>
          <div className="text-2xl text-primary-dark/20 self-center">VS</div>
          <div className={`text-center px-4 py-2 rounded-lg ${!isMyTurn && !gameOver ? 'bg-accent-neon/20 border border-accent-neon' : ''}`}>
            <p className="text-sm text-primary-dark/60">对方</p>
            <p className="text-2xl font-handwritten text-accent-neon">{scores[isPlayer1 ? 1 : 0]}</p>
          </div>
        </div>

        {!gameOver && (
          <p className="text-sm text-primary-dark/60 mb-4">
            {isMyTurn ? '轮到你了！点击翻牌' : '等待对方翻牌...'}
          </p>
        )}

        {/* Board */}
        <div className="grid grid-cols-4 gap-3 max-w-sm">
          {board.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`w-20 h-20 rounded-lg flex items-center justify-center text-3xl cursor-pointer transition-all duration-300 ${
                card.isFlipped || card.isMatched
                  ? card.isMatched
                    ? 'bg-accent-gold/20 border-2 border-accent-gold rotate-y-180'
                    : 'bg-primary-dark/10 border-2 border-primary-dark/20 rotate-y-180'
                  : 'bg-primary-dark border-2 border-primary-dark hover:border-accent-gold hover:scale-105'
              }`}
            >
              {card.isFlipped || card.isMatched ? card.emoji : '?'}
            </div>
          ))}
        </div>

        {gameOver && (
          <div className="mt-6 text-center">
            <p className="text-2xl font-handwritten text-primary-dark mb-4">
              {scores[myIndex] > scores[isPlayer1 ? 1 : 0] ? '你赢了！' :
               scores[myIndex] < scores[isPlayer1 ? 1 : 0] ? '你输了' : '平局!'}
            </p>
            <button onClick={() => router.push('/games')} className="px-8 py-3 bg-primary-dark text-primary-light rounded-xl font-handwritten text-lg">
              返回游戏厅
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
