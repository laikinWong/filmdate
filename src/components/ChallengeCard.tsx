'use client'

import Image from 'next/image'

interface ChallengeResponse {
  id: string
  photo_url: string
  caption?: string
  users: {
    name: string
    avatar_url?: string
  }
}

interface ChallengeCardProps {
  theme: string
  category: string
  responses: ChallengeResponse[]
  onComplete?: () => void
}

export default function ChallengeCard({ theme, category, responses, onComplete }: ChallengeCardProps) {
  const categoryColors: Record<string, string> = {
    '情感': 'bg-pink-100 text-pink-800',
    '观察': 'bg-blue-100 text-blue-800',
    '创意': 'bg-purple-100 text-purple-800',
    '生活': 'bg-green-100 text-green-800',
    '特殊': 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="bg-primary-dark/5 rounded-2xl p-6 backdrop-blur-sm border border-primary-dark/10">
      <div className="text-center mb-6">
        <div className="inline-block mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`}>
            {category}
          </span>
        </div>
        <p className="text-sm text-primary-dark/60 mb-2">今日主题</p>
        <h2 className="text-3xl font-handwritten text-accent-neon">
          {theme}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {responses.map((response, index) => (
          <div key={response.id} className="relative group">
            <div className="aspect-square relative rounded-lg overflow-hidden border-4 border-primary-dark/10 shadow-lg">
              <Image
                src={response.photo_url}
                alt={response.caption || '照片'}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-primary-dark">
                {response.users?.name || '匿名用户'}
              </p>
              {response.caption && (
                <p className="text-xs text-primary-dark/60 mt-1 line-clamp-2">
                  {response.caption}
                </p>
              )}
            </div>
          </div>
        ))}

        {responses.length < 2 && (
          <div className="aspect-square rounded-lg border-2 border-dashed border-primary-dark/20 flex flex-col items-center justify-center bg-primary-dark/5">
            <svg className="w-8 h-8 text-primary-dark/30 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-primary-dark/40 text-sm">等待对方...</span>
          </div>
        )}
      </div>

      {responses.length === 2 && onComplete && (
        <button
          onClick={onComplete}
          className="w-full mt-6 p-3 bg-accent-gold text-primary-dark rounded-lg hover:bg-accent-gold/90 transition-colors font-medium"
        >
          查看对比
        </button>
      )}
    </div>
  )
}
