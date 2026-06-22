import { useMemo } from 'react'
import { useStudents } from '../hooks/useStudents'
import { usePayments } from '../hooks/usePayments'
import { formatCurrency } from '../lib/format'

export default function Dashboard() {
  const { students } = useStudents()
  const { payments } = usePayments()

  const stats = useMemo(() => {
    const totalDue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
    const totalPaid = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0)
    const overdue = payments.filter((p) => p.status === 'overdue').length

    return { totalDue, totalPaid, overdue }
  }, [payments])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students" value={students.length} />
        <StatCard label="Total billed" value={formatCurrency(stats.totalDue)} />
        <StatCard label="Total collected" value={formatCurrency(stats.totalPaid)} />
        <StatCard label="Overdue payments" value={stats.overdue} />
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
