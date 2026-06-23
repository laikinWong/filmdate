'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import InviteCode from '@/components/InviteCode'
import LoadingScreen from '@/components/LoadingScreen'
import { getCurrentUser } from '@/lib/auth'
import { createCouple, joinCouple, getCouple } from '@/lib/couple'

export default function PairPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

      // If couple exists but not fully paired, show existing invite code
      if (couple && !couple.user2_id) {
        setInviteCode(couple.invite_code)
        setLoading(false)
        return
      }

      // No couple yet, create one and generate invite code
      const code = await createCouple(currentUser.id)
      setInviteCode(code)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (code: string) => {
    if (!user) return
    await joinCouple(user.id, code)
    router.push('/')
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <Layout showNavigation={false}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-accent-red mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary-dark text-primary-light rounded-lg"
            >
              重试
            </button>
          </div>
        </div>
      </Layout>
    )
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
              分享你的邀请码给对方，或输入对方的邀请码
            </p>
          </div>
          <div className="bg-primary-dark/5 rounded-2xl p-8">
            <InviteCode code={inviteCode} onJoin={handleJoin} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
