import { useSearchParams } from 'react-router-dom'
import { useStudents } from '../hooks/useStudents'
import { usePayments } from '../hooks/usePayments'
import PaymentForm from '../components/payments/PaymentForm'
import PaymentList from '../components/payments/PaymentList'

export default function Payments() {
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get('student') ?? undefined

  const { students } = useStudents()
  const { payments, loading, error, refresh } = usePayments(studentId)

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>

      <div className="mt-4">
        <PaymentForm students={students} defaultStudentId={studentId} onCreated={refresh} />
      </div>

      {loading && <p className="mt-4 text-sm text-gray-500">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && <PaymentList payments={payments} onChanged={refresh} />}
    </div>
  )
}
