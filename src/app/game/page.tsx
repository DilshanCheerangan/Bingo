import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProgressCard } from '@/components/bingo/ProgressCard'
import { BingoBoard } from '@/components/bingo/BingoBoard'
import { WinnerModal } from '@/components/bingo/WinnerModal'
import { SubmissionModal } from '@/components/bingo/SubmissionModal'
import { connection } from 'next/server'
import { RealtimeListener } from '@/components/RealtimeListener'

export const instant = false

export default async function GamePage() {
  await connection()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  // Get player and event
  const { data: player } = await supabase
    .from('players')
    .select('id, name, lc_name, event_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!player) {
    redirect('/')
  }

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', player.event_id)
    .single()

  if (!event) {
    return <div>Event not found</div>
  }

  // Get challenges
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('event_id', event.id)
    .order('sort_order', { ascending: true })

  // Get user's submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('event_id', event.id)
    .eq('player_id', player.id)

  const verifiedCount = submissions?.filter(s => s.status === 'approved').length || 0
  const isWinner = event.winner_player_id === player.id
  const someoneElseWon = event.winner_player_id && event.winner_player_id !== player.id

  // Map challenges to include their current status
  const boardChallenges = challenges?.map(challenge => {
    // Find latest submission for this challenge
    const challengeSubmissions = submissions?.filter(s => s.challenge_id === challenge.id) || []
    const latestSubmission = challengeSubmissions.sort((a, b) => 
      new Date(b.submitted_at!).getTime() - new Date(a.submitted_at!).getTime()
    )[0]

    return {
      ...challenge,
      status: latestSubmission ? latestSubmission.status : 'available',
      rejectionReason: latestSubmission?.status === 'rejected' ? latestSubmission.rejection_reason : null
    }
  }) || []

  return (
    <main className="min-h-screen bg-[#FAFAF8] pb-24">
      <RealtimeListener table="submissions" eventId={event.id} />
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-10 px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 tracking-tight">COMMUNITY BINGO</h1>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span className="relative flex h-2 w-2">
              {event.status === 'live' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${event.status === 'live' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </span>
            {event.status.toUpperCase()}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">Hey, {player.name} 👋</p>
        </div>
      </header>

      <div className="p-4 max-w-md mx-auto space-y-6">
        <ProgressCard verifiedCount={verifiedCount} totalRequired={6} />
        
        <BingoBoard 
          challenges={boardChallenges} 
          eventId={event.id}
          playerId={player.id}
          isPaused={event.status === 'paused'}
          isFinished={event.status === 'finished'}
        />
      </div>

      {isWinner && <WinnerModal show={true} isFirst={true} />}
      {someoneElseWon && !isWinner && <WinnerModal show={true} isFirst={false} />}
      
      {/* Realtime listener component to refresh the page could be added here */}
    </main>
  )
}
