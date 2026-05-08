import { useState, useCallback, useRef } from 'react'
import { searchCertificates, voidCertificate, unvoidCertificate } from '../lib/certificates'
import CertificatePanel from '../components/CertificatePanel'
import styles from './Search.module.css'

const LEVELS = ['CP1', 'One Star', 'Two Star', 'Three Star']

const VOIDED_OPTIONS = [
  { value: 'valid',  label: 'Valid' },
  { value: 'voided', label: 'Voided' },
  { value: 'all',    label: 'All' },
]

const COLUMNS = [
  { key: 'cert_serial_no',  label: 'Serial No.' },
  { key: 'name',            label: 'Name' },
  { key: 'gender',          label: 'Gender' },
  { key: 'dob',             label: 'Date of Birth' },
  { key: 'organisation',    label: 'Organisation' },
  { key: 'group',           label: 'Group' },
  { key: 'course_date',     label: 'Course Date' },
  { key: 'level_of_award',  label: 'Level of Award' },
  { key: 'assessor',        label: 'Assessor' },
  { key: 'instructor_cert', label: 'Instructor Cert' },
  { key: 'receipt_no',      label: 'Receipt No.' },
  { key: 'sheet',           label: 'Sheet' },
]

const HIGHLIGHT_KEYS = new Set(['name', 'cert_serial_no'])

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString()
}

function Highlight({ text, query }) {
  if (!query || !text) return <>{text ?? '—'}</>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = String(text).split(new RegExp(`(${escaped})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className={styles.highlight}>{part}</mark>
          : part
      )}
    </>
  )
}

export default function Search() {
  const [query, setQuery]               = useState('')
  const [results, setResults]           = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [searched, setSearched]         = useState(false)
  const [levelFilter, setLevelFilter]   = useState(null)
  const [voidedFilter, setVoidedFilter] = useState('valid')
  const [selectedCert, setSelectedCert] = useState(null)
  const [voidingId, setVoidingId]       = useState(null)
  const debounceRef = useRef(null)

  const runSearch = useCallback(async (q, opts) => {
    setLoading(true)
    setError(null)
    try {
      const data = await searchCertificates(q, opts)
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [])

  function scheduleSearch(q, level, voided) {
    clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); setSearched(false); return }
    debounceRef.current = setTimeout(
      () => runSearch(q.trim(), { levelOfAward: level, voidedFilter: voided }),
      350
    )
  }

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    scheduleSearch(q, levelFilter, voidedFilter)
  }

  function handleSubmit(e) {
    e.preventDefault()
    clearTimeout(debounceRef.current)
    if (query.trim()) runSearch(query.trim(), { levelOfAward: levelFilter, voidedFilter })
  }

  function handleLevelChange(level) {
    const next = levelFilter === level ? null : level
    setLevelFilter(next)
    scheduleSearch(query, next, voidedFilter)
  }

  function handleVoidedChange(val) {
    setVoidedFilter(val)
    scheduleSearch(query, levelFilter, val)
  }

  // Called by CertificatePanel after a successful edit save
  function handleUpdate(updated) {
    setResults(prev => prev.map(c => c.id === updated.id ? updated : c))
    setSelectedCert(updated)
  }

  async function handleVoidToggle(cert, e) {
    e.stopPropagation()
    setVoidingId(cert.id)
    try {
      const updated = cert.voided
        ? await unvoidCertificate(cert.id)
        : await voidCertificate(cert.id)
      setResults(prev => prev.map(c => c.id === updated.id ? updated : c))
      if (selectedCert?.id === updated.id) setSelectedCert(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setVoidingId(null)
    }
  }

  const displayedQuery = query.trim()

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

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Level</span>
          <button
            className={`${styles.chip} ${levelFilter === null ? styles.chipActive : ''}`}
            onClick={() => { setLevelFilter(null); scheduleSearch(query, null, voidedFilter) }}
          >
            All
          </button>
          {LEVELS.map(level => (
            <button
              key={level}
              className={`${styles.chip} ${levelFilter === level ? styles.chipActive : ''}`}
              onClick={() => handleLevelChange(level)}
            >
              {level}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Status</span>
          {VOIDED_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.chip} ${voidedFilter === opt.value ? styles.chipActive : ''}`}
              onClick={() => handleVoidedChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map(cert => (
                <tr
                  key={cert.id}
                  className={[
                    cert.voided ? styles.voided : '',
                    selectedCert?.id === cert.id ? styles.rowSelected : '',
                    styles.rowClickable,
                  ].join(' ')}
                  onClick={() => setSelectedCert(cert)}
                >
                  {COLUMNS.map(c => {
                    const isDate = c.key === 'dob' || c.key === 'course_date'
                    const raw = isDate ? formatDate(cert[c.key]) : (cert[c.key] ?? '—')
                    return (
                      <td key={c.key}>
                        {HIGHLIGHT_KEYS.has(c.key) && !isDate
                          ? <Highlight text={cert[c.key]} query={displayedQuery} />
                          : raw}
                      </td>
                    )
                  })}
                  <td>
                    <button
                      className={cert.voided ? styles.unvoidBtn : styles.voidBtn}
                      disabled={voidingId === cert.id}
                      onClick={e => handleVoidToggle(cert, e)}
                    >
                      {voidingId === cert.id ? '…' : cert.voided ? 'Unvoid' : 'Void'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCert && (
        <CertificatePanel
          cert={selectedCert}
          onClose={() => setSelectedCert(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
