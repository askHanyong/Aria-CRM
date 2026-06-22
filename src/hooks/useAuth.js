import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ensureTutorProfile } from '../lib/tutors'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      ensureTutorProfile(data.session?.user)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      ensureTutorProfile(newSession?.user)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  return { session, user: session?.user ?? null, loading }
}
