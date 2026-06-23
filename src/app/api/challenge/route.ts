import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]

    let { data: challenge } = await supabase
      .from('daily_challenges')
      .select('*, themes(*)')
      .eq('date', today)
      .single()

    if (!challenge) {
      // Get a random theme
      const { data: themes } = await supabase
        .from('themes')
        .select()
        .eq('is_special', false)

      if (!themes || themes.length === 0) {
        return NextResponse.json({ error: 'No themes available' }, { status: 500 })
      }

      const randomTheme = themes[Math.floor(Math.random() * themes.length)]

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

    return NextResponse.json(challenge)
  } catch (err) {
    console.error('Challenge API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
