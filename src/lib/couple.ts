import { createBrowserClient } from './supabase-browser'

export async function generateInviteCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function getMyCouple(userId: string) {
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

  if (!couple) return null

  // Verify this user is actually in this couple
  if (couple.user1_id !== userId && couple.user2_id !== userId) {
    return null
  }

  return couple
}

export async function getMyInviteCode(userId: string): Promise<string | null> {
  const supabase = createBrowserClient()

  const { data: couple } = await supabase
    .from('couples')
    .select('invite_code')
    .eq('user1_id', userId)
    .is('user2_id', null)
    .maybeSingle()

  return couple?.invite_code || null
}

export async function createCouple(userId: string): Promise<string> {
  const supabase = createBrowserClient()

  // Check if user already has an incomplete couple (as user1)
  const { data: existingCouple } = await supabase
    .from('couples')
    .select('id, invite_code')
    .eq('user1_id', userId)
    .is('user2_id', null)
    .maybeSingle()

  if (existingCouple) {
    // Update user's couple_id to this existing couple
    await supabase
      .from('users')
      .update({ couple_id: existingCouple.id })
      .eq('id', userId)
    return existingCouple.invite_code
  }

  // Create new couple
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
    .maybeSingle()

  if (findError) {
    throw new Error('查询邀请码失败: ' + findError.message)
  }
  if (!couple) {
    throw new Error('邀请码无效')
  }

  if (couple.user2_id) {
    throw new Error('该邀请码已被使用')
  }

  if (couple.user1_id === userId) {
    throw new Error('不能加入自己创建的情侣关系')
  }

  // Step 1: Delete any existing incomplete couples where this user is user1
  const { error: deleteError } = await supabase
    .from('couples')
    .delete()
    .eq('user1_id', userId)
    .is('user2_id', null)

  if (deleteError) {
    // Don't throw, might just not have any to delete
    console.warn('Delete old couple failed:', deleteError.message)
  }

  // Step 2: Update couple with second user
  const { error: updateError } = await supabase
    .from('couples')
    .update({ user2_id: userId })
    .eq('id', couple.id)

  if (updateError) {
    throw new Error('加入情侣失败: ' + updateError.message)
  }

  // Step 3: Update user's couple_id
  const { error: userUpdateError } = await supabase
    .from('users')
    .update({ couple_id: couple.id })
    .eq('id', userId)

  if (userUpdateError) {
    throw new Error('更新用户信息失败: ' + userUpdateError.message)
  }

  return couple
}

export async function getCouple(userId: string) {
  return getMyCouple(userId)
}

export async function getPartner(userId: string) {
  const couple = await getMyCouple(userId)
  if (!couple || !couple.user2_id) return null

  const partnerId = couple.user1_id === userId ? couple.user2_id : couple.user1_id

  const supabase = createBrowserClient()
  const { data: partner } = await supabase
    .from('users')
    .select('id, name, avatar_url')
    .eq('id', partnerId)
    .single()

  return partner
}
