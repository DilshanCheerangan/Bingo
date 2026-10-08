'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function joinEvent(prevState: any, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const lcName = formData.get('lcName') as string
  const eventCode = formData.get('eventCode') as string

  if (!name || !lcName || !eventCode) {
    return { error: 'All fields are required.' }
  }

  // Generate a dummy email and password for seamless login
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const normalizedLc = lcName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const email = `${normalizedName}.${normalizedLc}@${eventCode.toLowerCase()}.local`
  const password = `${eventCode}-${email}-secret`

  // 1. Verify Event Code
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, status')
    .eq('event_code', eventCode)
    .single()

  if (eventError || !event) {
    return { error: 'Invalid event code.' }
  }

  if (event.status !== 'live' && event.status !== 'draft') {
    return { error: 'This event is not currently accepting players.' }
  }

  // 2. Sign up or Sign in the user
  // For simplicity and immediate access during a live event without requiring email confirmation,
  // if you have disabled email confirmations in Supabase, this will log them in immediately.
  // We will use the service role key to create the user and bypass email rate limits
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  let authUserId = null;

  // Try signing in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (!signInError && signInData.user) {
    authUserId = signInData.user.id
  } else {
    // If sign in fails, create the user via admin to bypass rate limits
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // auto-confirm to prevent email sending
    })

    if (adminError) {
      if (adminError.message.includes('already registered')) {
        return { error: 'Authentication failed. Please try again.' }
      }
      return { error: adminError.message }
    }
    
    // Now sign them in on the client side
    const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (newSignInError || !newSignInData.user) {
       return { error: 'Failed to establish session after creation.' }
    }
    
    authUserId = newSignInData.user.id
  }

  if (!authUserId) {
    return { error: 'Could not authenticate user.' }
  }

  // 3. Create or get player record
  const { data: existingPlayer } = await supabase
    .from('players')
    .select('id')
    .eq('auth_user_id', authUserId)
    .eq('event_id', event.id)
    .single()

  if (!existingPlayer) {
    const { error: playerError } = await supabase
      .from('players')
      .insert({
        auth_user_id: authUserId,
        event_id: event.id,
        name,
        lc_name: lcName,
        role: 'player'
      })
      
    if (playerError) {
      return { error: 'Failed to create player profile.' }
    }
  }

  redirect('/game')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function adminLogin(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: 'Invalid admin credentials' }
  }

  // Verify they are an organizer
  const { data: player } = await supabase
    .from('players')
    .select('role')
    .eq('auth_user_id', data.user.id)
    .single()

  if (!player || player.role !== 'organizer') {
    await supabase.auth.signOut()
    return { error: 'Unauthorized. Organizer access required.' }
  }

  redirect('/admin')
}
