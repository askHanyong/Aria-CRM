import { supabase } from './supabase'

export async function ensureTutorProfile(user) {
  if (!user) return

  await supabase.from('tutors').upsert(
    {
      id: user.id,
      name: user.user_metadata?.name ?? user.email,
      email: user.email,
    },
    { onConflict: 'id', ignoreDuplicates: true },
  )
}
