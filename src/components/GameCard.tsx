'use client'

interface GameCardProps {
  title: string
  icon: string
  description: string
  type: 'reaction' | 'memory' | 'knowledge'
  onPlay: (type: 'reaction' | 'memory' | 'knowledge') => void
}

export default function GameCard({ title, icon, description, type, onPlay }: GameCardProps) {
  return (
    <div
      className="bg-primary-dark/5 rounded-xl p-6 border border-primary-dark/10 hover:border-accent-gold transition-all cursor-pointer group"
      onClick={() => onPlay(type)}
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-handwritten text-primary-dark mb-2">{title}</h3>
      <p className="text-sm text-primary-dark/60">{description}</p>
      <div className="mt-4">
        <span className="inline-block px-4 py-2 bg-primary-dark text-primary-light rounded-lg text-sm group-hover:bg-accent-gold group-hover:text-primary-dark transition-colors">
          开始游戏
        </span>
      </div>
    </div>
  )
}
