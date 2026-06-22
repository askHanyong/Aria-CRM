import { useSearchParams } from 'react-router-dom'
import { useStudents } from '../hooks/useStudents'
import { usePaymentCycles } from '../hooks/usePaymentCycles'
import PaymentCycleForm from '../components/payment-cycles/PaymentCycleForm'
import PaymentCycleList from '../components/payment-cycles/PaymentCycleList'

export default function PaymentCycles() {
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get('student') ?? undefined

  const { students } = useStudents()
  const { paymentCycles, loading, error, refresh } = usePaymentCycles(studentId)

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Payment cycles</h1>

      <div className="mt-4">
        <PaymentCycleForm students={students} defaultStudentId={studentId} onCreated={refresh} />
      </div>

      {loading && <p className="mt-4 text-sm text-gray-500">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && <PaymentCycleList paymentCycles={paymentCycles} onChanged={refresh} />}
    </div>
  )
}
