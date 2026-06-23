'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Timeline from '@/components/Timeline'
import LoadingScreen from '@/components/LoadingScreen'
import { getCurrentUser } from '@/lib/auth'
import { getCouple } from '@/lib/couple'
import { createBrowserClient } from '@/lib/supabase-browser'

interface TimelineItem {
  id: string
  photo_url: string
  caption?: string
  created_at: string
  type: 'challenge' | 'collage'
  theme?: string
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [couple, setCouple] = useState<any>(null)
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalPhotos: 0, streak: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      const coupleData = await getCouple(currentUser.id)
      if (!coupleData) {
        router.push('/pair')
        return
      }

      setCouple(coupleData)

      // Load timeline items
      const supabase = createBrowserClient()
      
      // Get challenge responses
      const { data: challengeResponses } = await supabase
        .from('challenge_responses')
        .select('*, daily_challenges(*, themes(*))')
        .or(`user_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false })
        .limit(50)

      // Get collages
      const { data: collages } = await supabase
        .from('collages')
        .select('*')
        .eq('couple_id', coupleData.id)
        .order('created_at', { ascending: false })
        .limit(50)

      // Combine and sort by date
      const items: TimelineItem[] = [
        ...(challengeResponses || []).map(r => ({
          id: r.id,
          photo_url: r.photo_url,
          caption: r.caption,
          created_at: r.created_at,
          type: 'challenge' as const,
          theme: r.daily_challenges?.themes?.content,
        })),
        ...(collages || []).map(c => ({
          id: c.id,
          photo_url: c.thumbnail_url || '',
          caption: c.title,
          created_at: c.created_at,
          type: 'collage' as const,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setTimelineItems(items)

      // Calculate stats
      setStats({
        totalPhotos: items.length,
        streak: calculateStreak(challengeResponses || []),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calculateStreak = (responses: any[]) => {
    if (responses.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let currentDate = new Date(today)

    for (const response of responses) {
      const responseDate = new Date(response.created_at)
      responseDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((currentDate.getTime() - responseDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 0 || diffDays === 1) {
        streak++
        currentDate = new Date(responseDate)
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-handwritten text-primary-dark mb-2">
            FilmDate
          </h1>
          <p className="text-primary-dark/60">
            用复古胶片记录你们的爱情故事
          </p>
        </div>

        {/* Stats */}
        <div className="max-w-md mx-auto mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-primary-dark/5 rounded-xl">
              <p className="text-3xl font-handwritten text-accent-gold">{stats.totalPhotos}</p>
              <p className="text-sm text-primary-dark/60">照片</p>
            </div>
            <div className="text-center p-4 bg-primary-dark/5 rounded-xl">
              <p className="text-3xl font-handwritten text-accent-neon">{stats.streak}</p>
              <p className="text-sm text-primary-dark/60">连续打卡</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="max-w-md mx-auto mb-8 flex gap-4">
          <button
            onClick={() => router.push('/challenge')}
            className="flex-1 p-4 bg-primary-dark text-primary-light rounded-xl hover:bg-primary-dark/90 transition-colors font-handwritten text-lg"
          >
            今日挑战
          </button>
          <button
            onClick={() => router.push('/editor')}
            className="flex-1 p-4 bg-accent-gold text-primary-dark rounded-xl hover:bg-accent-gold/90 transition-colors font-handwritten text-lg"
          >
            拼贴创作
          </button>
        </div>

        {/* Timeline */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-handwritten text-primary-dark mb-6">
            回忆墙
          </h2>
          <Timeline items={timelineItems} />
        </div>
      </div>
    </Layout>
  )
}
