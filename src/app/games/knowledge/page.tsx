'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { getCurrentUser } from '@/lib/auth'
import { getGameByRoomCode, createGame, joinGame, updateGameState, finishGame } from '@/lib/games'
import type { GameRecord, UserProfile } from '@/lib/types'

const QUESTIONS = [
  '对方最喜欢的食物是什么？',
  '对方最害怕什么？',
  '对方最喜欢的电影/电视剧是？',
  '对方最想去的地方是？',
  '对方的生日是几月几号？',
  '对方最喜欢的季节是？',
  '对方最喜欢的颜色是？',
  '对方最常说的话是什么？',
]

type KnowledgeAnswers = {
  player1?: string
  player2?: string
}

type KnowledgeGameState = Record<string, unknown> & {
  currentQuestion?: number
  answers?: KnowledgeAnswers
  scores?: number[]
}

type KnowledgeGame = GameRecord<KnowledgeGameState>

export default function KnowledgeGamePageWrapper() {
  return (
    <Suspense fallback={<Layout><div className="min-h-screen flex items-center justify-center">加载中...</div></Layout>}>
      <KnowledgeGamePage />
    </Suspense>
  )
}

function KnowledgeGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomCode = searchParams.get('room')

  const [user, setUser] = useState<UserProfile | null>(null)
  const [game, setGame] = useState<KnowledgeGame | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [myAnswer, setMyAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [opponentAnswer, setOpponentAnswer] = useState('')
  const [scores, setScores] = useState([0, 0])
  const [phase, setPhase] = useState<'answering' | 'revealing' | 'finished'>('answering')
  const [roomInput, setRoomInput] = useState('')

  const isPlayer1 = game?.player1_id === user?.id
  const myIndex = isPlayer1 ? 0 : 1

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) { router.push('/auth/login'); return }
      setUser(currentUser)

      if (roomCode) {
        const existingGame = await getGameByRoomCode(roomCode) as KnowledgeGame | null
        if (existingGame) {
          if (!existingGame.player2_id && existingGame.player1_id !== currentUser.id) {
            const joined = await joinGame(currentUser.id, roomCode) as KnowledgeGame
            setGame(joined)
          } else {
            setGame(existingGame)
            const state = existingGame.game_state
            if (state) {
              setCurrentQuestion(state.currentQuestion || 0)
              setScores(state.scores || [0, 0])
            }
          }
        }
      }
    }

    init()
  }, [roomCode, router])

  const handleSubmit = async () => {
    if (!myAnswer.trim() || !game) return
    setSubmitted(true)

    const state = game.game_state || {}
    const answers = { ...(state.answers || { player1: '', player2: '' }) }
    const key = isPlayer1 ? 'player1' : 'player2'
    answers[key] = myAnswer.trim()

    await updateGameState(game.id, { ...state, answers, currentQuestion })
    setGame({ ...game, game_state: { ...state, answers, currentQuestion } })

    // Check if both submitted
    const otherKey = isPlayer1 ? 'player2' : 'player1'
    if (answers[otherKey]) {
      setOpponentAnswer(answers[otherKey])
      setPhase('revealing')
    }
  }

  // Poll for opponent answer
  useEffect(() => {
    if (!game || phase !== 'answering') return
    const interval = setInterval(async () => {
      const refreshed = await getGameByRoomCode(game.room_code) as KnowledgeGame | null
      if (refreshed) {
        const state = refreshed.game_state
        const otherKey = isPlayer1 ? 'player2' : 'player1'
        if (state?.answers?.[otherKey]) {
          setOpponentAnswer(state.answers[otherKey])
          if (submitted) {
            setPhase('revealing')
          }
        }
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [game, isPlayer1, phase, submitted])

  const handleNextQuestion = () => {
    const newScores = [...scores]
    // Simple match check
    if (myAnswer.trim().toLowerCase() === opponentAnswer.trim().toLowerCase()) {
      newScores[myIndex]++
    }

    const nextQ = currentQuestion + 1
    if (nextQ >= QUESTIONS.length) {
      // Game over
      setScores(newScores)
      setPhase('finished')
      if (game) {
        updateGameState(game.id, { ...game.game_state, scores: newScores, currentQuestion: nextQ })
        const winnerId = newScores[0] > newScores[1] ? game.player1_id : game.player2_id
        if (winnerId) finishGame(game.id, winnerId)
      }
    } else {
      setCurrentQuestion(nextQ)
      setMyAnswer('')
      setSubmitted(false)
      setOpponentAnswer('')
      setPhase('answering')
      setScores(newScores)
      if (game) {
        updateGameState(game.id, { ...game.game_state, scores: newScores, currentQuestion: nextQ, answers: { player1: '', player2: '' } })
      }
    }
  }

  const handleCreateRoom = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) { router.push('/auth/login'); return }
    const newGame = await createGame(currentUser.id, 'knowledge') as KnowledgeGame
    setGame(newGame)
    window.history.replaceState(null, '', `/games/knowledge?room=${newGame.room_code}`)
  }

  const handleJoinRoom = async () => {
    if (roomInput.length !== 6) return
    const currentUser = await getCurrentUser()
    if (!currentUser) { router.push('/auth/login'); return }
    try {
      const joined = await joinGame(currentUser.id, roomInput) as KnowledgeGame
      setGame(joined)
      window.history.replaceState(null, '', `/games/knowledge?room=${joined.room_code}`)
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
            <h1 className="text-4xl font-handwritten text-primary-dark mb-2">💕 了解度PK</h1>
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
          <p className="text-sm text-primary-dark/40">第 {currentQuestion + 1} / {QUESTIONS.length} 题</p>
        </div>

        {/* Scores */}
        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <p className="text-sm text-primary-dark/60">你</p>
            <p className="text-3xl font-handwritten text-accent-gold">{scores[myIndex]}</p>
          </div>
          <div className="text-2xl text-primary-dark/20">VS</div>
          <div className="text-center">
            <p className="text-sm text-primary-dark/60">对方</p>
            <p className="text-3xl font-handwritten text-accent-neon">{scores[isPlayer1 ? 1 : 0]}</p>
          </div>
        </div>

        {/* Question */}
        <div className="w-full max-w-md bg-primary-dark/5 rounded-xl p-8 mb-6 text-center">
          <p className="text-2xl font-handwritten text-primary-dark">
            {QUESTIONS[currentQuestion]}
          </p>
        </div>

        {phase === 'answering' && (
          <div className="w-full max-w-md space-y-4">
            <input
              type="text"
              placeholder="你的答案..."
              value={myAnswer}
              onChange={e => setMyAnswer(e.target.value)}
              disabled={submitted}
              className="w-full p-4 text-lg bg-primary-light border-2 border-primary-dark/20 rounded-xl focus:border-accent-gold focus:outline-none text-center"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={submitted || !myAnswer.trim()}
              className="w-full p-4 bg-primary-dark text-primary-light rounded-xl font-handwritten text-lg disabled:opacity-50"
            >
              {submitted ? '等待对方回答...' : '提交答案'}
            </button>
          </div>
        )}

        {phase === 'revealing' && (
          <div className="w-full max-w-md space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent-gold/10 rounded-xl p-4 text-center">
                <p className="text-sm text-primary-dark/60 mb-2">你的答案</p>
                <p className="text-lg font-handwritten text-primary-dark">{myAnswer}</p>
              </div>
              <div className="bg-accent-neon/10 rounded-xl p-4 text-center">
                <p className="text-sm text-primary-dark/60 mb-2">对方的答案</p>
                <p className="text-lg font-handwritten text-primary-dark">{opponentAnswer}</p>
              </div>
            </div>
            <p className="text-center text-lg font-handwritten text-primary-dark">
              {myAnswer.trim().toLowerCase() === opponentAnswer.trim().toLowerCase()
                ? '答案一致！双方得分 🎉' : '答案不一致'}
            </p>
            <button
              onClick={handleNextQuestion}
              className="w-full p-4 bg-accent-gold text-primary-dark rounded-xl font-handwritten text-lg"
            >
              {currentQuestion + 1 >= QUESTIONS.length ? '查看结果' : '下一题'}
            </button>
          </div>
        )}

        {phase === 'finished' && (
          <div className="text-center">
            <p className="text-3xl font-handwritten text-primary-dark mb-4">
              {scores[myIndex] > scores[isPlayer1 ? 1 : 0] ? '你更了解对方！' :
               scores[myIndex] < scores[isPlayer1 ? 1 : 0] ? '对方更了解你' : '你们一样了解彼此！'}
            </p>
            <p className="text-xl text-primary-dark/60 mb-6">
              {scores[myIndex]} : {scores[isPlayer1 ? 1 : 0]}
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
