'use client'

import Image from 'next/image'
import { useState } from 'react'

interface PhotoCardProps {
  photoUrl: string
  caption?: string
  date: string
  type: 'challenge' | 'collage'
  theme?: string
}

export default function PhotoCard({ photoUrl, caption, date, type, theme }: PhotoCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="relative cursor-pointer group perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative transition-transform duration-700 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="relative aspect-square rounded-lg overflow-hidden border-4 border-primary-light shadow-lg backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Image
            src={photoUrl}
            alt={caption || '照片'}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/40 to-transparent p-4">
            <p className="text-primary-light text-sm font-handwritten line-clamp-2">
              {caption || theme || '点击翻转查看'}
            </p>
          </div>
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              type === 'challenge' 
                ? 'bg-accent-neon/80 text-primary-light' 
                : 'bg-accent-gold/80 text-primary-dark'
            }`}>
              {type === 'challenge' ? '每日挑战' : '拼贴作品'}
            </span>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-primary-dark/95 rounded-lg p-6 flex flex-col justify-center items-center rotate-y-180 backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-center">
            {theme && (
              <p className="text-accent-neon font-handwritten text-lg mb-2">
                主题：{theme}
              </p>
            )}
            <p className="text-primary-light text-lg font-handwritten mb-3">
              {caption || '没有留下文字'}
            </p>
            <p className="text-primary-light/60 text-sm mb-4">{date}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              type === 'challenge'
                ? 'bg-accent-neon/20 text-accent-neon'
                : 'bg-accent-gold/20 text-accent-gold'
            }`}>
              {type === 'challenge' ? '每日挑战' : '拼贴作品'}
            </span>
          </div>
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-accent-gold/5 rounded-lg border-2 border-accent-gold/20" />
      </div>
    </div>
  )
}
