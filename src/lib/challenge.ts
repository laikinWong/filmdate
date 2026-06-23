import { createBrowserClient } from './supabase-browser'

export async function getTodayChallenge() {
  const supabase = createBrowserClient()
  const today = new Date().toISOString().split('T')[0]

  // Get or create today's challenge
  let { data: challenge } = await supabase
    .from('daily_challenges')
    .select('*, themes(*)')
    .eq('date', today)
    .single()

  if (!challenge) {
    // Get a random non-special theme
    const { data: themes } = await supabase
      .from('themes')
      .select()
      .eq('is_special', false)

    if (!themes || themes.length === 0) {
      throw new Error('没有可用的主题')
    }

    const randomTheme = themes[Math.floor(Math.random() * themes.length)]

    // Create today's challenge
    const { data: newChallenge, error } = await supabase
      .from('daily_challenges')
      .insert({
        date: today,
        theme_id: randomTheme.id,
      })
      .select('*, themes(*)')
      .single()

    if (error) throw error
    challenge = newChallenge
  }

  return challenge
}

export async function getChallengeResponses(challengeId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('challenge_responses')
    .select('*, users(*)')
    .eq('challenge_id', challengeId)

  if (error) throw error
  return data || []
}

export async function submitResponse(
  challengeId: string,
  userId: string,
  photoUrl: string,
  caption?: string,
  filterId?: string
) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('challenge_responses')
    .insert({
      challenge_id: challengeId,
      user_id: userId,
      photo_url: photoUrl,
      caption,
      filter_id: filterId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadPhoto(file: File | Blob, userId: string): Promise<string> {
  const supabase = createBrowserClient()
  
  const fileName = `${userId}/${Date.now()}-${file instanceof File ? file.name : 'photo.jpg'}`
  
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName)

  return publicUrl
}

export async function getUserChallengeStats(userId: string) {
  const supabase = createBrowserClient()

  // Get total responses
  const { count: totalResponses } = await supabase
    .from('challenge_responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get current streak
  const { data: recentResponses } = await supabase
    .from('challenge_responses')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  let streak = 0
  if (recentResponses && recentResponses.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let currentDate = new Date(today)
    
    for (const response of recentResponses) {
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
  }

  return {
    totalResponses: totalResponses || 0,
    streak,
  }
}

export async function getChallengeHistory(userId: string, limit = 10) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('challenge_responses')
    .select('*, daily_challenges(*, themes(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}
