import { useMemo } from 'react'
import { useStudents } from '../hooks/useStudents'
import { useLessons } from '../hooks/useLessons'
import { usePaymentCycles } from '../hooks/usePaymentCycles'
import { formatCurrency } from '../lib/format'

export default function Dashboard() {
  const { students } = useStudents()
  const { lessons } = useLessons()
  const { paymentCycles } = usePaymentCycles()

  const stats = useMemo(() => {
    const totalDue = paymentCycles.reduce((sum, p) => sum + Number(p.amount_due), 0)
    const totalPaid = paymentCycles
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount_due), 0)
    const overdue = paymentCycles.filter((p) => p.status === 'overdue').length
    const upcomingLessons = lessons.filter((l) => l.status === 'scheduled').length

    return { totalDue, totalPaid, overdue, upcomingLessons }
  }, [paymentCycles, lessons])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Students" value={students.length} />
        <StatCard label="Upcoming lessons" value={stats.upcomingLessons} />
        <StatCard label="Total billed" value={formatCurrency(stats.totalDue)} />
        <StatCard label="Total collected" value={formatCurrency(stats.totalPaid)} />
        <StatCard label="Overdue cycles" value={stats.overdue} />
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
