import { useState, useCallback, useRef } from 'react'
import { searchCertificates } from '../lib/certificates'
import styles from './Search.module.css'

const COLUMNS = [
  { key: 'cert_serial_no', label: 'Serial No.' },
  { key: 'name',           label: 'Name' },
  { key: 'gender',         label: 'Gender' },
  { key: 'dob',            label: 'Date of Birth' },
  { key: 'organisation',   label: 'Organisation' },
  { key: 'group',          label: 'Group' },
  { key: 'course_date',    label: 'Course Date' },
  { key: 'level_of_award', label: 'Level of Award' },
  { key: 'assessor',       label: 'Assessor' },
  { key: 'instructor_cert',label: 'Instructor Cert' },
  { key: 'receipt_no',     label: 'Receipt No.' },
  { key: 'sheet',          label: 'Sheet' },
]

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString()
}

export default function Search() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef(null)

  const runSearch = useCallback(async (q) => {
    setLoading(true)
    setError(null)
    try {
      const data = await searchCertificates(q)
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [])

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(debounceRef.current)
    if (!q.trim()) {
      setResults([])
      setSearched(false)
      return
    }
    debounceRef.current = setTimeout(() => runSearch(q.trim()), 350)
  }

  function handleSubmit(e) {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    if (query.trim()) runSearch(query.trim())
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Certificate Search</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          type="search"
          placeholder="Search by name or serial number…"
          value={query}
          onChange={handleChange}
          autoFocus
        />
        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {searched && !loading && (
        <p className={styles.count}>
          {results.length === 0
            ? 'No certificates found.'
            : `${results.length} result${results.length === 1 ? '' : 's'} found.`}
        </p>
      )}

      {results.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {COLUMNS.map(c => <th key={c.key}>{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {results.map(cert => (
                <tr key={cert.id} className={cert.voided ? styles.voided : ''}>
                  {COLUMNS.map(c => (
                    <td key={c.key}>
                      {c.key === 'dob' || c.key === 'course_date'
                        ? formatDate(cert[c.key])
                        : cert[c.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
