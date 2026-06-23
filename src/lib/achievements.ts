import { createBrowserClient } from './supabase-browser'

export interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon: string
  requirement: number
  category: 'streak' | 'photos' | 'collage' | 'special'
}

export const achievements: Achievement[] = [
  // Streak achievements
  {
    id: 'streak-3',
    type: 'streak',
    title: '初露锋芒',
    description: '连续打卡3天',
    icon: '🔥',
    requirement: 3,
    category: 'streak',
  },
  {
    id: 'streak-7',
    type: 'streak',
    title: '一周坚持',
    description: '连续打卡7天',
    icon: '🔥',
    requirement: 7,
    category: 'streak',
  },
  {
    id: 'streak-30',
    type: 'streak',
    title: '月度坚持',
    description: '连续打卡30天',
    icon: '💎',
    requirement: 30,
    category: 'streak',
  },
  {
    id: 'streak-100',
    type: 'streak',
    title: '百日情侣',
    description: '连续打卡100天',
    icon: '👑',
    requirement: 100,
    category: 'streak',
  },
  // Photo achievements
  {
    id: 'photos-10',
    type: 'photos',
    title: '摄影新手',
    description: '上传10张照片',
    icon: '📸',
    requirement: 10,
    category: 'photos',
  },
  {
    id: 'photos-50',
    type: 'photos',
    title: '摄影达人',
    description: '上传50张照片',
    icon: '🏆',
    requirement: 50,
    category: 'photos',
  },
  {
    id: 'photos-100',
    type: 'photos',
    title: '摄影大师',
    description: '上传100张照片',
    icon: '🌟',
    requirement: 100,
    category: 'photos',
  },
  // Collage achievements
  {
    id: 'collage-1',
    type: 'collage',
    title: '拼贴新手',
    description: '创建1个拼贴作品',
    icon: '🎨',
    requirement: 1,
    category: 'collage',
  },
  {
    id: 'collage-5',
    type: 'collage',
    title: '拼贴达人',
    description: '创建5个拼贴作品',
    icon: '🎭',
    requirement: 5,
    category: 'collage',
  },
  {
    id: 'collage-20',
    type: 'collage',
    title: '拼贴大师',
    description: '创建20个拼贴作品',
    icon: '👨‍🎨',
    requirement: 20,
    category: 'collage',
  },
  // Special achievements
  {
    id: 'first-challenge',
    type: 'special',
    title: '初次挑战',
    description: '完成第一次每日挑战',
    icon: '🎉',
    requirement: 1,
    category: 'special',
  },
  {
    id: 'paired',
    type: 'special',
    title: '情定今生',
    description: '成功配对情侣关系',
    icon: '💕',
    requirement: 1,
    category: 'special',
  },
]

export async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const supabase = createBrowserClient()
  const unlockedAchievements: string[] = []

  // Get user's current achievements
  const { data: userAchievements } = await supabase
    .from('achievements')
    .select('type')
    .eq('user_id', userId)

  const unlockedTypes = new Set(userAchievements?.map(a => a.type) || [])

  // Check streak
  const streak = await getStreak(userId)
  const streakMilestones = [3, 7, 30, 100]
  for (const milestone of streakMilestones) {
    const achievementId = `streak-${milestone}`
    if (streak >= milestone && !unlockedTypes.has(achievementId)) {
      await unlockAchievement(userId, achievementId)
      unlockedAchievements.push(achievementId)
    }
  }

  // Check photo count
  const photoCount = await getPhotoCount(userId)
  const photoMilestones = [10, 50, 100]
  for (const milestone of photoMilestones) {
    const achievementId = `photos-${milestone}`
    if (photoCount >= milestone && !unlockedTypes.has(achievementId)) {
      await unlockAchievement(userId, achievementId)
      unlockedAchievements.push(achievementId)
    }
  }

  // Check collage count
  const collageCount = await getCollageCount(userId)
  const collageMilestones = [1, 5, 20]
  for (const milestone of collageMilestones) {
    const achievementId = `collage-${milestone}`
    if (collageCount >= milestone && !unlockedTypes.has(achievementId)) {
      await unlockAchievement(userId, achievementId)
      unlockedAchievements.push(achievementId)
    }
  }

  // Check first challenge
  if (photoCount >= 1 && !unlockedTypes.has('first-challenge')) {
    await unlockAchievement(userId, 'first-challenge')
    unlockedAchievements.push('first-challenge')
  }

  // Check paired
  const { data: user } = await supabase
    .from('users')
    .select('couple_id')
    .eq('id', userId)
    .single()

  if (user?.couple_id && !unlockedTypes.has('paired')) {
    await unlockAchievement(userId, 'paired')
    unlockedAchievements.push('paired')
  }

  return unlockedAchievements
}

async function getStreak(userId: string): Promise<number> {
  const supabase = createBrowserClient()
  
  const { data: responses } = await supabase
    .from('challenge_responses')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!responses || responses.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let currentDate = new Date(today)

  for (const response of responses) {
    const responseDate = new Date(response.created_at)
    responseDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((currentDate.getTime() - responseDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0 || diffDays === 1) {
      streak++
      currentDate = new Date(responseDate)
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

async function getPhotoCount(userId: string): Promise<number> {
  const supabase = createBrowserClient()
  
  const { count } = await supabase
    .from('challenge_responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return count || 0
}

async function getCollageCount(userId: string): Promise<number> {
  const supabase = createBrowserClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('couple_id')
    .eq('id', userId)
    .single()

  if (!user?.couple_id) return 0

  const { count } = await supabase
    .from('collages')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', user.couple_id)

  return count || 0
}

async function unlockAchievement(userId: string, type: string) {
  const supabase = createBrowserClient()

  await supabase
    .from('achievements')
    .insert({
      user_id: userId,
      type,
    })
}

export async function getUserAchievements(userId: string) {
  const supabase = createBrowserClient()

  const { data } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)

  return data || []
}

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find(a => a.id === id)
}

export function getAchievementsByCategory(category: Achievement['category']) {
  return achievements.filter(a => a.category === category)
}
