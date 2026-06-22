import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true })

    if (error) setError(error.message)
    else setStudents(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  return { students, loading, error, refresh }
}
