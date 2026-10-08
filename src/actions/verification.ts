'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reviewSubmission(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const submissionId = formData.get('submissionId') as string
  const action = formData.get('action') as 'approve' | 'reject'
  const rejectionReason = formData.get('rejectionReason') as string | null

  if (!submissionId || !action) {
    return { error: 'Missing required fields' }
  }

  // Check if organizer
  const { data: organizer } = await supabase
    .from('players')
    .select('id, event_id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!organizer || organizer.role !== 'organizer') {
    return { error: 'Unauthorized organizer access' }
  }

  // Update submission status
  const { data: submission, error: updateError } = await supabase
    .from('submissions')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      rejection_reason: action === 'reject' ? rejectionReason : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: organizer.id
    })
    .eq('id', submissionId)
    .select('event_id, player_id')
    .single()

  if (updateError || !submission) {
    return { error: 'Failed to update submission' }
  }

  // If approved, check if they won (using our RPC function)
  if (action === 'approve') {
    const { data: isWinner, error: rpcError } = await supabase
      .rpc('claim_event_winner', {
        p_event_id: submission.event_id,
        p_player_id: submission.player_id
      })
      
    if (rpcError) {
      console.error('Error claiming winner:', rpcError)
    } else if (isWinner) {
      console.log('We have a winner!', submission.player_id)
    }
  }

  revalidatePath('/admin')
  return { success: true }
}
