import { createBrowserClient } from './supabase-browser'

export async function generateInviteCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createCouple(userId: string): Promise<string> {
  const supabase = createBrowserClient()
  const inviteCode = await generateInviteCode()

  const { data, error } = await supabase
    .from('couples')
    .insert({
      user1_id: userId,
      invite_code: inviteCode,
    })
    .select()
    .single()

  if (error) throw error

  // Update user's couple_id
  await supabase
    .from('users')
    .update({ couple_id: data.id })
    .eq('id', userId)

  return inviteCode
}

export async function joinCouple(userId: string, inviteCode: string) {
  const supabase = createBrowserClient()

  // Find couple by invite code
  const { data: couple, error: findError } = await supabase
    .from('couples')
    .select()
    .eq('invite_code', inviteCode)
    .single()

  if (findError || !couple) {
    throw new Error('邀请码无效')
  }

  if (couple.user2_id) {
    throw new Error('该邀请码已被使用')
  }

  if (couple.user1_id === userId) {
    throw new Error('不能加入自己创建的情侣关系')
  }

  // Update couple with second user
  const { error: updateError } = await supabase
    .from('couples')
    .update({ user2_id: userId })
    .eq('id', couple.id)

  if (updateError) throw updateError

  // Update user's couple_id
  await supabase
    .from('users')
    .update({ couple_id: couple.id })
    .eq('id', userId)

  return couple
}

export async function getCouple(userId: string) {
  const supabase = createBrowserClient()

  const { data: user } = await supabase
    .from('users')
    .select('couple_id')
    .eq('id', userId)
    .single()

  if (!user?.couple_id) return null

  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .eq('id', user.couple_id)
    .single()

  return couple
}

export async function getPartner(userId: string) {
  const supabase = createBrowserClient()

  const couple = await getCouple(userId)
  if (!couple) return null

  const partnerId = couple.user1_id === userId ? couple.user2_id : couple.user1_id

  const { data: partner } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .eq('id', partnerId)
    .single()

  return partner
}
