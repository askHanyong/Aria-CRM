import { useStudents } from '../hooks/useStudents'
import StudentForm from '../components/students/StudentForm'
import StudentList from '../components/students/StudentList'

export default function Students() {
  const { students, loading, error, refresh } = useStudents()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Students</h1>

      <div className="mt-4">
        <StudentForm onCreated={refresh} />
      </div>

      {loading && <p className="mt-4 text-sm text-gray-500">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {!loading && !error && <StudentList students={students} />}
    </div>
  )
}
