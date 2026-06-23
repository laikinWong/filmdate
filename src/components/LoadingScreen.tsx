'use client'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-primary-light flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          {/* Film reel animation */}
          <div className="absolute inset-0 border-4 border-primary-dark/20 rounded-full" />
          <div 
            className="absolute inset-2 border-4 border-accent-gold rounded-full animate-spin" 
            style={{ animationDuration: '2s' }} 
          />
          <div className="absolute inset-4 border-4 border-primary-dark/20 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🎬</span>
          </div>
        </div>
        <p className="text-primary-dark/60 font-handwritten text-lg">
          加载中...
        </p>
      </div>
    </div>
  )
}
