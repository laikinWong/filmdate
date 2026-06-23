'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: '回忆墙', icon: '📸' },
  { href: '/challenge', label: '今日挑战', icon: '🎬' },
  { href: '/editor', label: '拼贴编辑', icon: '🎨' },
  { href: '/achievements', label: '成就', icon: '🏆' },
  { href: '/profile', label: '我的', icon: '👤' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary-dark/90 backdrop-blur-sm z-40 border-t border-primary-dark/20">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                isActive
                  ? 'text-accent-neon'
                  : 'text-primary-light/60 hover:text-primary-light'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1 font-handwritten">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-accent-neon rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
