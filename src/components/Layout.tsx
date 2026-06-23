'use client'

import FilmGrain from './FilmGrain'
import Navigation from './Navigation'

interface LayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
}

export default function Layout({ children, showNavigation = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-primary-light film-grain">
      <FilmGrain />
      <main className={showNavigation ? 'pb-20' : ''}>
        {children}
      </main>
      {showNavigation && <Navigation />}
    </div>
  )
}
