'use client'

import PhotoCard from './PhotoCard'

interface TimelineItem {
  id: string
  photo_url: string
  caption?: string
  created_at: string
  type: 'challenge' | 'collage'
  theme?: string
}

interface TimelineProps {
  items: TimelineItem[]
}

export default function Timeline({ items }: TimelineProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-handwritten text-primary-dark mb-2">
          还没有回忆
        </h3>
        <p className="text-primary-dark/60">
          去完成每日挑战或创作拼贴作品吧！
        </p>
      </div>
    )
  }

  // Group items by month
  const groupedItems = items.reduce((groups, item) => {
    const date = new Date(item.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        label: monthLabel,
        items: [],
      }
    }
    groups[monthKey].items.push(item)
    
    return groups
  }, {} as Record<string, { label: string; items: TimelineItem[] }>)

  // Sort months in descending order
  const sortedMonths = Object.entries(groupedItems).sort(([a], [b]) => b.localeCompare(a))

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-dark/10 hidden md:block" />

      {sortedMonths.map(([monthKey, { label, items: monthItems }]) => (
        <div key={monthKey} className="relative mb-12">
          {/* Month header */}
          <div className="sticky top-20 z-10 mb-6">
            <div className="inline-flex items-center gap-3">
              <div className="hidden md:block w-4 h-4 rounded-full bg-accent-gold border-4 border-primary-light shadow-lg" />
              <span className="inline-block px-4 py-2 bg-primary-dark text-primary-light rounded-full text-sm font-handwritten shadow-lg">
                {label}
              </span>
            </div>
          </div>

          {/* Photos grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:ml-12">
            {monthItems.map((item) => (
              <PhotoCard
                key={item.id}
                photoUrl={item.photo_url}
                caption={item.caption}
                date={new Date(item.created_at).toLocaleDateString('zh-CN', {
                  month: 'long',
                  day: 'numeric',
                })}
                type={item.type}
                theme={item.theme}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
