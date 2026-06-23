'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import LoadingScreen from '@/components/LoadingScreen'
import { getCurrentUser } from '@/lib/auth'
import { getCouple, createCouple, joinCouple, getMyInviteCode } from '@/lib/couple'

export default function PairPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [myInviteCode, setMyInviteCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // Check if already fully paired
      const couple = await getCouple(currentUser.id)
      if (couple && couple.user2_id) {
        router.push('/')
        return
      }

      // Check if user already has an invite code
      const existingCode = await getMyInviteCode(currentUser.id)
      if (existingCode) {
        setMyInviteCode(existingCode)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInviteCode = async () => {
    if (!user) return
    setCreateLoading(true)
    setError('')
    try {
      const code = await createCouple(user.id)
      setMyInviteCode(code)
      setMode('create')
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!user || inputCode.length !== 6) return
    setJoinLoading(true)
    setError('')
    try {
      await joinCouple(user.id, inputCode.toUpperCase())
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '加入失败')
    } finally {
      setJoinLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(myInviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = myInviteCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Layout showNavigation={false}>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-handwritten text-primary-dark mb-2">
              配对你们的情侣关系
            </h1>
            <p className="text-primary-dark/60">
              选择一种方式开始你们的故事
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg text-center">
              <p className="text-accent-red text-sm">{error}</p>
            </div>
          )}

          {/* Choose mode */}
          {mode === 'choose' && !myInviteCode && (
            <div className="space-y-4">
              <button
                onClick={handleCreateInviteCode}
                disabled={createLoading}
                className="w-full p-6 bg-primary-dark/5 rounded-xl border-2 border-primary-dark/10 hover:border-accent-gold transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">📤</span>
                  <div>
                    <p className="font-handwritten text-lg text-primary-dark">
                      {createLoading ? '创建中...' : '生成邀请码'}
                    </p>
                    <p className="text-sm text-primary-dark/60">
                      生成邀请码发给对方，让 TA 输入加入
                    </p>
                  </div>
                </div>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary-dark/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-primary-light text-primary-dark/40">或者</span>
                </div>
              </div>

              <button
                onClick={() => setMode('join')}
                className="w-full p-6 bg-primary-dark/5 rounded-xl border-2 border-primary-dark/10 hover:border-accent-gold transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">📥</span>
                  <div>
                    <p className="font-handwritten text-lg text-primary-dark">
                      输入对方邀请码
                    </p>
                    <p className="text-sm text-primary-dark/60">
                      输入对方发给你的 6 位邀请码加入
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Show invite code (after creation or if already exists) */}
          {(mode === 'create' || (myInviteCode && mode === 'choose')) && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-primary-dark/60 mb-3 font-medium">你的邀请码</p>
                <div className="relative inline-block">
                  <div className="text-5xl font-mono tracking-[0.3em] text-accent-gold bg-primary-dark/5 p-6 rounded-xl border-2 border-dashed border-accent-gold/30">
                    {myInviteCode}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="absolute -top-2 -right-2 px-3 py-1 bg-accent-gold text-primary-dark text-xs rounded-full hover:bg-accent-gold/90 transition-colors font-medium"
                  >
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
                <p className="text-sm text-primary-dark/40 mt-3">
                  把这个邀请码发给你的另一半
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary-dark/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-primary-light text-primary-dark/40">或者</span>
                </div>
              </div>

              <button
                onClick={() => setMode('join')}
                className="w-full p-4 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 transition-colors font-medium"
              >
                输入对方的邀请码
              </button>
            </div>
          )}

          {/* Join mode */}
          {mode === 'join' && (
            <div className="space-y-6">
              <div>
                <p className="text-primary-dark/60 mb-3 font-medium text-center">输入对方的邀请码</p>
                <div className="flex gap-3 justify-center">
                  <input
                    type="text"
                    placeholder="6位邀请码"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-48 p-3 text-center text-2xl font-mono tracking-[0.2em] bg-primary-light border-2 border-primary-dark/20 rounded-lg focus:border-accent-gold focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleJoin}
                    disabled={inputCode.length !== 6 || joinLoading}
                    className="px-6 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {joinLoading ? '...' : '加入'}
                  </button>
                </div>
              </div>

              {myInviteCode && (
                <button
                  onClick={() => setMode('create')}
                  className="w-full text-sm text-primary-dark/40 hover:text-primary-dark/60 text-center"
                >
                  ← 返回查看我的邀请码
                </button>
              )}
              {!myInviteCode && (
                <button
                  onClick={() => setMode('choose')}
                  className="w-full text-sm text-primary-dark/40 hover:text-primary-dark/60 text-center"
                >
                  ← 返回
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
