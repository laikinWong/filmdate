'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import LoadingScreen from '@/components/LoadingScreen'
import { getCurrentUser } from '@/lib/auth'
import { getUserAchievements, achievements, Achievement } from '@/lib/achievements'

export default function AchievementsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const userAchievements = await getUserAchievements(user.id)
      setUnlockedAchievements(new Set(userAchievements.map(a => a.type)))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { key: 'streak', label: '连续打卡', icon: '🔥' },
    { key: 'photos', label: '摄影作品', icon: '📸' },
    { key: 'collage', label: '拼贴创作', icon: '🎨' },
    { key: 'special', label: '特殊成就', icon: '⭐' },
  ]

  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(a => a.category === category)
  }

  const totalAchievements = achievements.length
  const unlockedCount = unlockedAchievements.size
  const progress = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-handwritten text-primary-dark mb-2">
            成就系统
          </h1>
          <p className="text-primary-dark/60">
            记录你们的每一个里程碑
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-primary-dark/5 rounded-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-primary-dark/60">解锁进度</span>
              <span className="font-handwritten text-accent-gold">
                {unlockedCount}/{totalAchievements}
              </span>
            </div>
            <div className="w-full h-3 bg-primary-dark/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-gold to-accent-neon rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-primary-dark/40 mt-2">
              {progress.toFixed(0)}% 完成
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-4xl mx-auto space-y-8">
          {categories.map((category) => {
            const categoryAchievements = getAchievementsByCategory(category.key)
            const unlockedInCategory = categoryAchievements.filter(a => unlockedAchievements.has(a.id)).length

            return (
              <div key={category.key} className="bg-primary-dark/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-xl font-handwritten text-primary-dark">
                      {category.label}
                    </h2>
                  </div>
                  <span className="text-sm text-primary-dark/60">
                    {unlockedInCategory}/{categoryAchievements.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryAchievements.map((achievement) => {
                    const isUnlocked = unlockedAchievements.has(achievement.id)
                    return (
                      <div
                        key={achievement.id}
                        className={`p-4 rounded-lg text-center transition-all ${
                          isUnlocked
                            ? 'bg-primary-light border-2 border-accent-gold/30 shadow-lg'
                            : 'bg-primary-dark/10 border-2 border-transparent opacity-50'
                        }`}
                      >
                        <div className={`text-3xl mb-2 ${!isUnlocked ? 'grayscale' : ''}`}>
                          {achievement.icon}
                        </div>
                        <h3 className={`font-handwritten text-sm mb-1 ${
                          isUnlocked ? 'text-primary-dark' : 'text-primary-dark/40'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-xs ${
                          isUnlocked ? 'text-primary-dark/60' : 'text-primary-dark/30'
                        }`}>
                          {achievement.description}
                        </p>
                        {isUnlocked && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-accent-gold/20 text-accent-gold text-xs rounded-full">
                              已解锁
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
