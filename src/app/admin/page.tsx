import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { reviewSubmission } from '@/actions/verification'
import { connection } from 'next/server'
import { RealtimeListener } from '@/components/RealtimeListener'

export const instant = false

export default async function AdminPage() {
  await connection()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/admin/login')
  }

  // Get organizer info
  const { data: organizer } = await supabase
    .from('players')
    .select('id, name, event_id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!organizer || organizer.role !== 'organizer') {
    return <div className="p-8 text-center text-red-500">Unauthorized. Organizer access required.</div>
  }

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', organizer.event_id)
    .single()

  if (!event) {
    return <div>Event not found</div>
  }

  // Get participants
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('event_id', event.id)
    .eq('role', 'player')

  // Get submissions
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      challenges (title, proof_requirements),
      players (name, lc_name)
    `)
    .eq('event_id', event.id)
    .order('submitted_at', { ascending: false })

  const pendingSubmissions = submissions?.filter(s => s.status === 'pending') || []

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <RealtimeListener table="submissions" eventId={event.id} />
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-gray-900 text-xl">ORGANIZER DASHBOARD</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              {event.status === 'live' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${event.status === 'live' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </span>
            <span className="text-sm text-gray-600 uppercase">{event.status}</span>
          </div>
        </div>
        <div className="text-sm text-gray-600 flex gap-4">
          <div>Participants: <span className="font-bold text-gray-900">{players?.length || 0}</span></div>
          <div>Pending: <span className="font-bold text-gray-900">{pendingSubmissions.length}</span></div>
        </div>
      </header>

      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <section>
          <h2 className="text-lg font-bold mb-4">PENDING VERIFICATIONS</h2>
          {pendingSubmissions.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-200">
              No pending verifications. Good job! 🎉
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingSubmissions.map((sub: any) => (
                <div key={sub.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{sub.players.name}</h3>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-700">{sub.players.lc_name}</span>
                    </div>
                    <p className="text-sm font-medium text-coral-600">{sub.challenges.title}</p>
                    <p className="text-xs text-gray-500 mt-2">Submitted {new Date(sub.submitted_at).toLocaleString()}</p>
                  </div>
                  
                  {/* Simplistic proof viewer placeholder. Should generate signed URL in real implementation */}
                  <div className="bg-gray-900 aspect-video flex items-center justify-center text-white text-xs text-center p-4">
                    Proof Media: <br /> {sub.proof_path} <br /> ({sub.proof_type})
                  </div>

                  <div className="p-4 bg-gray-50 flex gap-2">
                    <form action={reviewSubmission} className="flex-1">
                      <input type="hidden" name="submissionId" value={sub.id} />
                      <input type="hidden" name="action" value="approve" />
                      <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors">
                        ✓ APPROVE
                      </button>
                    </form>
                    <form action={reviewSubmission} className="flex-1">
                      <input type="hidden" name="submissionId" value={sub.id} />
                      <input type="hidden" name="action" value="reject" />
                      <input type="hidden" name="rejectionReason" value="Does not meet requirements." />
                      <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition-colors">
                        ✕ REJECT
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
