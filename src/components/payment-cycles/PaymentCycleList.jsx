import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../lib/format'

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
}

export default function PaymentCycleList({ paymentCycles, onChanged }) {
  if (paymentCycles.length === 0) {
    return <p className="mt-4 text-sm text-gray-500">No payment cycles yet.</p>
  }

  const markPaid = async (id) => {
    await supabase.from('payment_cycles').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', id)
    onChanged?.()
  }

  return (
    <table className="mt-4 w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
      <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
        <tr>
          <th className="px-4 py-2">Student</th>
          <th className="px-4 py-2">Period</th>
          <th className="px-4 py-2">Amount due</th>
          <th className="px-4 py-2">Due date</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2" />
        </tr>
      </thead>
      <tbody>
        {paymentCycles.map((cycle) => (
          <tr key={cycle.id} className="border-t border-gray-100 hover:bg-gray-50">
            <td className="px-4 py-2">{cycle.students?.name ?? '—'}</td>
            <td className="px-4 py-2 text-gray-600">
              {formatDate(cycle.period_start)} – {formatDate(cycle.period_end)}
            </td>
            <td className="px-4 py-2">{formatCurrency(cycle.amount_due)}</td>
            <td className="px-4 py-2 text-gray-600">{formatDate(cycle.due_date)}</td>
            <td className="px-4 py-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[cycle.status]}`}>
                {cycle.status}
              </span>
            </td>
            <td className="px-4 py-2 text-right">
              {cycle.status !== 'paid' && (
                <button onClick={() => markPaid(cycle.id)} className="text-xs text-indigo-600 hover:underline">
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
