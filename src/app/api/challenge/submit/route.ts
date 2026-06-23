import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
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

    const { challengeId, photoUrl, caption, filterId } = await request.json()

    if (!challengeId || !photoUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user already submitted for this challenge
    const { data: existing } = await supabase
      .from('challenge_responses')
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('challenge_responses')
      .insert({
        challenge_id: challengeId,
        user_id: user.id,
        photo_url: photoUrl,
        caption,
        filter_id: filterId,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err) {
    console.error('Challenge submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
