const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateChallenges() {
  const updates = [
    { sort_order: 1, title: "Make Us Laugh", icon: "😂", description: "Send something funny in the group that gets at least 3 reactions." },
    { sort_order: 2, title: "Funny Sticker", icon: "😂", description: "Send a funny sticker of yourself." },
    { sort_order: 3, title: "Share Your Centre Moment", icon: "", description: "Share a favourite memory or moment from KP in the group." },
    { sort_order: 4, title: "Text a Stranger", icon: "👋", description: "Text a volunteer from ANOTHER LC, NOT your classmate." },
    { sort_order: 5, title: "Movie Dialogue", icon: "🎤", description: "Send a voice note saying any movie dialogue in the centre group." },
    { sort_order: 6, title: "Unpopular Food Combo", icon: "🍕", description: "Share an unpopular food combination you like." },
    { sort_order: 7, title: "Childhood Photo", icon: "👶", description: "Share a cute photo of yourself as a child." },
    { sort_order: 8, title: "Unpopular Opinion", icon: "🔥", description: "Share one of your unpopular opinions." },
    { sort_order: 9, title: "Sing a Song", icon: "🎵", description: "Sing the chorus of your favourite song in the centre group." },
  ];

  for (const u of updates) {
    await supabase.from('challenges').update({
      title: u.title,
      icon: u.icon,
      description: u.description
    }).eq('sort_order', u.sort_order);
  }
  console.log("Updated challenges");
}

updateChallenges();
