const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log("Starting seed...")

  // Create event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      name: 'Community Event 2026',
      event_code: 'BINGO26',
      status: 'live'
    })
    .select()
    .single()

  if (eventError) {
    console.error("Event error:", eventError)
    return
  }

  console.log("Created event:", event.id)

  const challenges = [
    {
      title: "MAKE US LAUGH",
      description: "Send something funny in the group that gets at least 3 reactions.",
      icon: "😂",
      proof_requirements: "Screenshot showing the message and reactions.",
      sort_order: 1
    },
    {
      title: "FUNNY STICKER",
      description: "Send a funny sticker of yourself.",
      icon: "😜",
      proof_requirements: "Screenshot.",
      sort_order: 2
    },
    {
      title: "CENTRE MOMENT",
      description: "Share a favourite memory or moment from a centre activity in the group.",
      icon: "📸",
      proof_requirements: "Photo or screenshot.",
      sort_order: 3
    },
    {
      title: "TEXT A STRANGER",
      description: "Text a volunteer from ANOTHER LC whom you don't know.\n\nIMPORTANT RULE:\nThey must be a stranger from another LC, NOT your classmate.",
      icon: "👋",
      proof_requirements: "Screenshot showing the conversation.",
      sort_order: 4
    },
    {
      title: "MOVIE DIALOGUE",
      description: "Send a voice note saying any movie dialogue in the centre group.",
      icon: "🎤",
      proof_requirements: "Audio recording OR screenshot of the group message.",
      sort_order: 5
    },
    {
      title: "UNPOPULAR FOOD COMBO",
      description: "Share an unpopular food combination you like.",
      icon: "🍕",
      proof_requirements: "Screenshot of group post.",
      sort_order: 6
    },
    {
      title: "CHILDHOOD PHOTO",
      description: "Share a cute photo of yourself as a child.",
      icon: "👶",
      proof_requirements: "Screenshot of the group post.",
      sort_order: 7
    },
    {
      title: "UNPOPULAR OPINION",
      description: "Share one of your unpopular opinions.",
      icon: "🔥",
      proof_requirements: "Screenshot of group post.",
      sort_order: 8
    },
    {
      title: "SING A SONG",
      description: "Sing the chorus of your favourite song in the centre group.",
      icon: "🎵",
      proof_requirements: "Audio/video OR screenshot of the group post.",
      sort_order: 9
    }
  ]

  for (const c of challenges) {
    await supabase.from('challenges').insert({
      event_id: event.id,
      ...c
    })
  }

  console.log("Challenges seeded.")

  // Create an organizer
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@bingo.local',
    password: 'password123',
    email_confirm: true
  })

  if (!authError && authUser) {
    await supabase.from('players').insert({
      auth_user_id: authUser.user.id,
      name: 'Organizer',
      lc_name: 'HQ',
      role: 'organizer',
      event_id: event.id
    })
    console.log("Organizer created (admin@bingo.local / password123)")
  }
}

seed().catch(console.error)
