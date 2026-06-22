import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function usePaymentCycles(studentId) {
  const [paymentCycles, setPaymentCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('payment_cycles')
      .select('*, students(name)')
      .order('due_date', { ascending: false })

    if (studentId) query = query.eq('student_id', studentId)

    const { data, error } = await query

    if (error) setError(error.message)
    else setPaymentCycles(data)
    setLoading(false)
  }, [studentId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh()
  }, [refresh])

  return { paymentCycles, loading, error, refresh }
}
