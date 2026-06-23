import { render, screen } from '@testing-library/react'
import Navigation from '@/components/Navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

describe('Navigation', () => {
  it('renders navigation items', () => {
    render(<Navigation />)
    
    expect(screen.getByText('回忆墙')).toBeTruthy()
    expect(screen.getByText('今日挑战')).toBeTruthy()
    expect(screen.getByText('拼贴编辑')).toBeTruthy()
    expect(screen.getByText('成就')).toBeTruthy()
    expect(screen.getByText('我的')).toBeTruthy()
  })

  it('renders navigation icons', () => {
    render(<Navigation />)
    
    expect(screen.getByText('📸')).toBeTruthy()
    expect(screen.getByText('🎬')).toBeTruthy()
    expect(screen.getByText('🎨')).toBeTruthy()
    expect(screen.getByText('🏆')).toBeTruthy()
    expect(screen.getByText('👤')).toBeTruthy()
  })
})
