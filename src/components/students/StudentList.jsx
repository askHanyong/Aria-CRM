import { Link } from 'react-router-dom'
import { formatCurrency } from '../../lib/format'

export default function StudentList({ students }) {
  if (students.length === 0) {
    return <p className="mt-4 text-sm text-gray-500">No students yet.</p>
  }

  return (
    <table className="mt-4 w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
      <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
        <tr>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Guardian email</th>
          <th className="px-4 py-2">Monthly fee</th>
          <th className="px-4 py-2" />
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id} className="border-t border-gray-100 hover:bg-gray-50">
            <td className="px-4 py-2">
              <Link to={`/lessons?student=${student.id}`} className="text-indigo-600 hover:underline">
                {student.name}
              </Link>
            </td>
            <td className="px-4 py-2 text-gray-600">{student.guardian_email ?? '—'}</td>
            <td className="px-4 py-2 text-gray-600">
              {student.monthly_fee != null ? formatCurrency(student.monthly_fee) : '—'}
            </td>
            <td className="px-4 py-2 text-gray-600">
              <Link to={`/payment-cycles?student=${student.id}`} className="text-indigo-600 hover:underline">
                Payment cycles
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
