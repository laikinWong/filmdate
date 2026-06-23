import { achievements, getAchievementById, getAchievementsByCategory } from '@/lib/achievements'

describe('Achievements', () => {
  it('should have 12 achievements', () => {
    expect(achievements).toHaveLength(12)
  })

  it('should have correct achievement properties', () => {
    achievements.forEach(achievement => {
      expect(achievement).toHaveProperty('id')
      expect(achievement).toHaveProperty('type')
      expect(achievement).toHaveProperty('title')
      expect(achievement).toHaveProperty('description')
      expect(achievement).toHaveProperty('icon')
      expect(achievement).toHaveProperty('requirement')
      expect(achievement).toHaveProperty('category')
    })
  })

  it('should find achievement by id', () => {
    const achievement = getAchievementById('streak-7')
    expect(achievement).toBeDefined()
    expect(achievement?.title).toBe('一周坚持')
  })

  it('should return undefined for unknown achievement id', () => {
    const achievement = getAchievementById('unknown-achievement')
    expect(achievement).toBeUndefined()
  })

  it('should have achievements in all categories', () => {
    const categories = ['streak', 'photos', 'collage', 'special']
    categories.forEach(category => {
      const categoryAchievements = getAchievementsByCategory(category as any)
      expect(categoryAchievements.length).toBeGreaterThan(0)
    })
  })

  it('should have unique achievement ids', () => {
    const ids = achievements.map(a => a.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have correct streak achievements', () => {
    const streakAchievements = getAchievementsByCategory('streak')
    expect(streakAchievements).toHaveLength(4)
    
    const requirements = streakAchievements.map(a => a.requirement).sort((a, b) => a - b)
    expect(requirements).toEqual([3, 7, 30, 100])
  })

  it('should have correct photo achievements', () => {
    const photoAchievements = getAchievementsByCategory('photos')
    expect(photoAchievements).toHaveLength(3)
    
    const requirements = photoAchievements.map(a => a.requirement).sort((a, b) => a - b)
    expect(requirements).toEqual([10, 50, 100])
  })
})
