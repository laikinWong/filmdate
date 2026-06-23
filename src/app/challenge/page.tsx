'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import ChallengeCard from '@/components/ChallengeCard'
import PhotoUpload from '@/components/PhotoUpload'
import FilterSelector from '@/components/FilterSelector'
import LoadingScreen from '@/components/LoadingScreen'
import { getTodayChallenge, getChallengeResponses, submitResponse, uploadPhoto } from '@/lib/challenge'
import { getCurrentUser } from '@/lib/auth'

export default function ChallengePage() {
  const router = useRouter()
  const [challenge, setChallenge] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [selectedFilter, setSelectedFilter] = useState('kodak-portra')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState('')

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

      const todayChallenge = await getTodayChallenge()
      setChallenge(todayChallenge)

      if (todayChallenge) {
        const challengeResponses = await getChallengeResponses(todayChallenge.id)
        setResponses(challengeResponses)
        setHasSubmitted(challengeResponses.some(r => r.user_id === currentUser.id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (file: File, filteredBlob: Blob) => {
    if (!user || !challenge) return

    setSubmitting(true)
    try {
      const photoUrl = await uploadPhoto(filteredBlob, user.id)
      await submitResponse(challenge.id, user.id, photoUrl, undefined, selectedFilter)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <Layout>
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
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-handwritten text-primary-dark mb-2">
            今日挑战
          </h1>
          <p className="text-primary-dark/60">
            用镜头记录此刻，分享你的视角
          </p>
        </div>

        {challenge && (
          <div className="max-w-md mx-auto space-y-6">
            <ChallengeCard
              theme={challenge.themes.content}
              category={challenge.themes.category}
              responses={responses}
            />

            {!hasSubmitted && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-handwritten text-primary-dark mb-3">
                    选择滤镜
                  </h3>
                  <FilterSelector
                    selectedFilter={selectedFilter}
                    onSelect={setSelectedFilter}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-handwritten text-primary-dark mb-3">
                    上传照片
                  </h3>
                  <PhotoUpload
                    onUpload={handlePhotoUpload}
                    filterId={selectedFilter}
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

            {hasSubmitted && responses.length < 2 && (
              <div className="text-center p-6 bg-accent-gold/10 rounded-xl border border-accent-gold/20">
                <p className="text-accent-gold font-handwritten text-lg">
                  等待对方上传照片...
                </p>
                <p className="text-primary-dark/60 text-sm mt-1">
                  照片将在双方都上传后展示
                </p>
              </div>
            )}

            {hasSubmitted && responses.length === 2 && (
              <div className="text-center p-6 bg-accent-neon/10 rounded-xl border border-accent-neon/20">
                <p className="text-accent-neon font-handwritten text-lg">
                  挑战完成！
                </p>
                <p className="text-primary-dark/60 text-sm mt-1">
                  查看你们的照片对比吧
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
