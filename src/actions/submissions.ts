'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitProof(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const challengeId = formData.get('challengeId') as string
  const eventId = formData.get('eventId') as string
  const file = formData.get('file') as File

  if (!challengeId || !eventId || !file) {
    return { error: 'Missing required fields' }
  }

  // Get player
  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('auth_user_id', user.id)
    .eq('event_id', eventId)
    .single()

  if (!player) {
    return { error: 'Player not found for this event' }
  }

  // Check if already approved
  const { data: existingApproved } = await supabase
    .from('submissions')
    .select('id')
    .eq('player_id', player.id)
    .eq('challenge_id', challengeId)
    .eq('status', 'approved')
    .single()

  if (existingApproved) {
    return { error: 'Already approved for this challenge' }
  }

  // Upload file to storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `events/${eventId}/players/${player.id}/${challengeId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('bingo-proofs')
    .upload(filePath, file)

  if (uploadError) {
    return { error: 'Failed to upload proof' }
  }

  // Create submission record
  const { data: newSub, error: insertError } = await supabase
    .from('submissions')
    .insert({
      event_id: eventId,
      player_id: player.id,
      challenge_id: challengeId,
      proof_path: filePath,
      proof_type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio',
      status: 'pending'
    })
    .select('id')
    .single()

  if (insertError || !newSub) {
    return { error: 'Failed to save submission record' }
  }

  // FAKE ADMIN VERIFICATION
  // Auto-approve after 3 to 5 seconds for testing
  const delayMs = Math.floor(Math.random() * (5000 - 3000 + 1) + 3000)
  
  setTimeout(async () => {
    try {
      const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      // Update to approved
      await adminClient.from('submissions').update({
        status: 'approved',
        reviewed_at: new Date().toISOString()
      }).eq('id', newSub.id)

      // Check for winner
      await adminClient.rpc('claim_event_winner', {
        p_event_id: eventId,
        p_player_id: player.id
      })
    } catch(e) {
      console.error('Auto-approve failed', e)
    }
  }, delayMs)

  revalidatePath('/game')
  revalidatePath('/admin')
  return { success: true }
}
