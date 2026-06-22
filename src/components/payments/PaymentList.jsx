import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../lib/format'

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
}

export default function PaymentList({ payments, onChanged }) {
  if (payments.length === 0) {
    return <p className="mt-4 text-sm text-gray-500">No payments yet.</p>
  }

  const markPaid = async (id) => {
    await supabase.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id)
    onChanged?.()
  }

  return (
    <table className="mt-4 w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
      <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
        <tr>
          <th className="px-4 py-2">Student</th>
          <th className="px-4 py-2">Amount</th>
          <th className="px-4 py-2">Due date</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2" />
        </tr>
      </thead>
      <tbody>
        {payments.map((payment) => (
          <tr key={payment.id} className="border-t border-gray-100 hover:bg-gray-50">
            <td className="px-4 py-2">{payment.students?.name ?? '—'}</td>
            <td className="px-4 py-2">{formatCurrency(payment.amount)}</td>
            <td className="px-4 py-2 text-gray-600">{formatDate(payment.due_date)}</td>
            <td className="px-4 py-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[payment.status]}`}>
                {payment.status}
              </span>
            </td>
            <td className="px-4 py-2 text-right">
              {payment.status !== 'paid' && (
                <button onClick={() => markPaid(payment.id)} className="text-xs text-indigo-600 hover:underline">
                  Mark paid
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
