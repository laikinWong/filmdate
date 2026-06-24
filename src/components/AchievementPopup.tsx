'use client'

import { useEffect, useState } from 'react'
import { achievements } from '@/lib/achievements'

interface AchievementPopupProps {
  achievementType: string
  onClose: () => void
}

export default function AchievementPopup({ achievementType, onClose }: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const achievement = achievements.find(a => a.id === achievementType)

  useEffect(() => {
    // Show with animation
    setTimeout(() => setIsVisible(true), 100)

    // Auto close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!achievement) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-primary-dark/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Popup */}
      <div
        className={`relative bg-primary-light rounded-2xl p-8 max-w-sm mx-4 text-center transform transition-all duration-500 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-75 translate-y-10'
        }`}
      >
        {/* Sparkle effect */}
        <div className="absolute -top-4 -left-4 w-8 h-8 text-accent-gold animate-pulse">✨</div>
        <div className="absolute -top-4 -right-4 w-8 h-8 text-accent-gold animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute -bottom-4 -left-4 w-8 h-8 text-accent-gold animate-pulse" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute -bottom-4 -right-4 w-8 h-8 text-accent-gold animate-pulse" style={{ animationDelay: '1.5s' }}>✨</div>

        {/* Icon */}
        <div className="text-7xl mb-4 animate-bounce">{achievement.icon}</div>
        
        {/* Title */}
        <h3 className="text-2xl font-handwritten text-primary-dark mb-2">
          成就解锁！
        </h3>
        
        {/* Achievement name */}
        <p className="text-xl font-handwritten text-accent-gold mb-2">
          {achievement.title}
        </p>
        
        {/* Description */}
        <p className="text-primary-dark/60 mb-6">
          {achievement.description}
        </p>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="px-6 py-2 bg-primary-dark text-primary-light rounded-lg hover:bg-primary-dark/90 transition-colors font-medium"
        >
          太棒了！
        </button>
      </div>
    </div>
  )
}
