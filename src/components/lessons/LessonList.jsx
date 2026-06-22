import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../lib/format'

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700',
  scheduled: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-gray-200 text-gray-600',
}

export default function LessonList({ lessons, onChanged }) {
  if (lessons.length === 0) {
    return <p className="mt-4 text-sm text-gray-500">No lessons yet.</p>
  }

  const markCompleted = async (id) => {
    await supabase.from('lessons').update({ status: 'completed' }).eq('id', id)
    onChanged?.()
  }

  return (
    <table className="mt-4 w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
      <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
        <tr>
          <th className="px-4 py-2">Student</th>
          <th className="px-4 py-2">Date</th>
          <th className="px-4 py-2">Duration</th>
          <th className="px-4 py-2">Rate</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2" />
        </tr>
      </thead>
      <tbody>
        {lessons.map((lesson) => (
          <tr key={lesson.id} className="border-t border-gray-100 hover:bg-gray-50">
            <td className="px-4 py-2">{lesson.students?.name ?? '—'}</td>
            <td className="px-4 py-2 text-gray-600">{formatDate(lesson.lesson_date)}</td>
            <td className="px-4 py-2 text-gray-600">{lesson.duration_minutes} min</td>
            <td className="px-4 py-2">{formatCurrency(lesson.rate)}</td>
            <td className="px-4 py-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[lesson.status]}`}>
                {lesson.status}
              </span>
            </td>
            <td className="px-4 py-2 text-right">
              {lesson.status === 'scheduled' && (
                <button onClick={() => markCompleted(lesson.id)} className="text-xs text-indigo-600 hover:underline">
                  Mark completed
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
