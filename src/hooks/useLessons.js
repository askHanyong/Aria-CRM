import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useLessons(studentId) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('lessons')
      .select('*, students(name)')
      .order('lesson_date', { ascending: false })

    if (studentId) query = query.eq('student_id', studentId)

    const { data, error } = await query

    if (error) setError(error.message)
    else setLessons(data)
    setLoading(false)
  }, [studentId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  return { lessons, loading, error, refresh }
}
