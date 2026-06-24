'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import LoadingScreen from '@/components/LoadingScreen'
import { getCurrentUser, signOut } from '@/lib/auth'
import { getCouple, getPartner } from '@/lib/couple'
import { getUserChallengeStats } from '@/lib/challenge'
import { getUserAchievements, achievements } from '@/lib/achievements'
import type { Couple, UserProfile } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [partner, setPartner] = useState<UserProfile | null>(null)
  const [couple, setCouple] = useState<Couple | null>(null)
  const [stats, setStats] = useState({ totalResponses: 0, streak: 0 })
  const [userAchievements, setUserAchievements] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/auth/login')
          return
        }

        setUser(currentUser)

        const coupleData = await getCouple(currentUser.id)
        setCouple(coupleData)

        if (coupleData) {
          const partnerData = await getPartner(currentUser.id)
          setPartner(partnerData)
        }

        const challengeStats = await getUserChallengeStats(currentUser.id)
        setStats(challengeStats)

        const userAchievementsData = await getUserAchievements(currentUser.id)
        setUserAchievements(new Set(userAchievementsData.map(a => a.type)))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (err) {
      console.error(err)
    }
  }

  const unlockedCount = userAchievements.size
  const totalAchievements = achievements.length

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-handwritten text-primary-dark mb-2">
            个人中心
          </h1>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* User Info */}
          <div className="bg-primary-dark/5 rounded-xl p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-dark/10 flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <h2 className="text-xl font-handwritten text-primary-dark mb-1">
              {user?.name || '未设置昵称'}
            </h2>
            <p className="text-sm text-primary-dark/60">
              {user?.email}
            </p>
          </div>

          {/* Partner Info */}
          {partner && (
            <div className="bg-primary-dark/5 rounded-xl p-6">
              <h3 className="text-lg font-handwritten text-primary-dark mb-4 text-center">
                你们的情侣关系
              </h3>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-dark/10 flex items-center justify-center mb-2">
                    <span className="text-xl">👤</span>
                  </div>
                  <p className="text-sm font-handwritten text-primary-dark">
                    {user?.name || '你'}
                  </p>
                </div>
                <div className="text-2xl text-accent-neon">💕</div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-dark/10 flex items-center justify-center mb-2">
                    <span className="text-xl">👤</span>
                  </div>
                  <p className="text-sm font-handwritten text-primary-dark">
                    {partner.name || 'TA'}
                  </p>
                </div>
              </div>
              {couple?.invite_code && (
                <div className="mt-4 text-center">
                  <p className="text-xs text-primary-dark/40">邀请码</p>
                  <p className="font-mono text-accent-gold tracking-widest">
                    {couple.invite_code}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-dark/5 rounded-xl p-4 text-center">
              <p className="text-3xl font-handwritten text-accent-gold">
                {stats.totalResponses}
              </p>
              <p className="text-sm text-primary-dark/60">挑战照片</p>
            </div>
            <div className="bg-primary-dark/5 rounded-xl p-4 text-center">
              <p className="text-3xl font-handwritten text-accent-neon">
                {stats.streak}
              </p>
              <p className="text-sm text-primary-dark/60">连续打卡</p>
            </div>
          </div>

          {/* Achievements Preview */}
          <div className="bg-primary-dark/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-handwritten text-primary-dark">
                成就
              </h3>
              <button
                onClick={() => router.push('/achievements')}
                className="text-sm text-accent-gold hover:underline"
              >
                查看全部
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full h-2 bg-primary-dark/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-gold to-accent-neon rounded-full"
                    style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-primary-dark/40 mt-1">
                  已解锁 {unlockedCount}/{totalAchievements}
                </p>
              </div>
              <div className="text-2xl">🏆</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!couple && (
              <button
                onClick={() => router.push('/pair')}
                className="w-full p-3 bg-accent-gold text-primary-dark rounded-lg hover:bg-accent-gold/90 transition-colors font-medium"
              >
                配对情侣关系
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="w-full p-3 bg-primary-dark/10 text-primary-dark rounded-lg hover:bg-primary-dark/20 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
