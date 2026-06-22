import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function StudentForm({ onCreated }) {
  const [name, setName] = useState('')
  const [guardianEmail, setGuardianEmail] = useState('')
  const [monthlyFee, setMonthlyFee] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.from('students').insert({
      name,
      guardian_email: guardianEmail || null,
      monthly_fee: monthlyFee ? Number(monthlyFee) : null,
    })

    if (error) {
      setError(error.message)
    } else {
      setName('')
      setGuardianEmail('')
      setMonthlyFee('')
      onCreated?.()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Student name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Guardian email</label>
        <input
          type="email"
          value={guardianEmail}
          onChange={(e) => setGuardianEmail(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Monthly fee</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
          className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        Add student
      </button>
    </form>
  )
}
