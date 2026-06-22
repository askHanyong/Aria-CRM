import { useSearchParams } from 'react-router-dom'
import { useStudents } from '../hooks/useStudents'
import { useLessons } from '../hooks/useLessons'
import LessonForm from '../components/lessons/LessonForm'
import LessonList from '../components/lessons/LessonList'

export default function Lessons() {
  const [searchParams] = useSearchParams()
  const studentId = searchParams.get('student') ?? undefined

  const { students } = useStudents()
  const { lessons, loading, error, refresh } = useLessons(studentId)

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Lessons</h1>

      <div className="mt-4">
        <LessonForm students={students} defaultStudentId={studentId} onCreated={refresh} />
      </div>

      {loading && <p className="mt-4 text-sm text-gray-500">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && <LessonList lessons={lessons} onChanged={refresh} />}
    </div>
  )
}
