import { createBrowserClient } from './supabase-browser'

export async function signUp(email: string, password: string, name: string) {
  const supabase = createBrowserClient()
  
  const { data: { user }, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  if (!user) throw new Error('User creation failed')

  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: user.id,
      name,
    })

  if (profileError) throw profileError

  return user
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient()
  
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return user
}

export async function signOut() {
  const supabase = createBrowserClient()
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = createBrowserClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function getSession() {
  const supabase = createBrowserClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
