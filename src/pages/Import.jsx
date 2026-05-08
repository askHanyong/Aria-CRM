import { useState, useCallback, useRef } from 'react'
import Papa from 'papaparse'
import { bulkInsertCertificates } from '../lib/certificates'
import { CERTIFICATE_FIELDS, FIELD_MAP } from '../lib/certificateFields'
import styles from './Import.module.css'

// All fields available as import targets, including voided
const IMPORTABLE_FIELDS = [
  ...CERTIFICATE_FIELDS,
  { key: 'voided', label: 'Voided', type: 'boolean' },
]
const IMPORTABLE_MAP = Object.fromEntries(IMPORTABLE_FIELDS.map(f => [f.key, f]))

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseDate(val) {
  if (!val) return null
  const s = String(val).trim()
  if (!s) return null
  // ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
}

function transformValue(raw, fieldKey) {
  const v = String(raw ?? '').trim()
  if (v === '') return null
  const field = IMPORTABLE_MAP[fieldKey]
  if (!field) return v
  if (field.type === 'date')    return parseDate(v)
  if (field.type === 'boolean') return ['true', '1', 'yes', 'y'].includes(v.toLowerCase())
  return v
}

// Tries to match a CSV header to a DB field key
function autoMap(header) {
  const h = header.toLowerCase().trim()
  const slug = h.replace(/[\s\-\.]+/g, '_')
  // Exact key
  const byKey = IMPORTABLE_FIELDS.find(f => f.key === slug || f.key === h)
  if (byKey) return byKey.key
  // Label
  const byLabel = IMPORTABLE_FIELDS.find(
    f => f.label.toLowerCase() === h || f.label.toLowerCase().replace(/[\s\.]+/g, '_') === slug
  )
  if (byLabel) return byLabel.key
  // Aliases
  const ALIASES = {
    serial: 'cert_serial_no', serial_no: 'cert_serial_no',
    serial_number: 'cert_serial_no', certificate_serial: 'cert_serial_no',
    date_of_birth: 'dob', birthday: 'dob', birth_date: 'dob', dob: 'dob',
    level: 'level_of_award', award: 'level_of_award', award_level: 'level_of_award',
    org: 'organisation', company: 'organisation',
    instructor: 'instructor_cert', instructor_certificate: 'instructor_cert',
    receipt: 'receipt_no', course: 'course_date',
  }
  return ALIASES[slug] ?? ''
}

function buildRecord(row, headers, mapping) {
  const record = {}
  headers.forEach((header, i) => {
    const fieldKey = mapping[header]
    if (!fieldKey) return
    record[fieldKey] = transformValue(row[i], fieldKey)
  })
  return record
}

// Generates an error CSV for download
function downloadErrorCSV(errors, headers) {
  const rows = [
    [...headers, 'Row #', 'Error'],
    ...errors.map(e => {
      const vals = headers.map((_, i) => e.rawRow[i] ?? '')
      return [...vals, e.index, e.message]
    }),
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'import_errors.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ── Step components ──────────────────────────────────────────────────────────

function StepUpload({ onParsed, dragOver, setDragOver }) {
  const inputRef = useRef(null)

  function parseFile(file) {
    if (!file || !file.name.endsWith('.csv')) return
    Papa.parse(file, {
      skipEmptyLines: true,
      complete({ data }) {
        if (data.length < 2) return
        const [headerRow, ...bodyRows] = data
        onParsed({ headers: headerRow, rows: bodyRows })
      },
    })
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    parseFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className={`${styles.dropZone} ${dragOver ? styles.dropZoneOver : ''}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className={styles.fileInput}
        onChange={e => parseFile(e.target.files[0])}
      />
      <div className={styles.dropIcon}>📄</div>
      <p className={styles.dropPrimary}>Drop your CSV here, or <span className={styles.dropLink}>browse</span></p>
      <p className={styles.dropSub}>Headers must be in the first row. Dates: DD/MM/YYYY or YYYY-MM-DD.</p>
    </div>
  )
}

function MappingRow({ header, samples, value, onChange }) {
  return (
    <tr>
      <td className={styles.mapHeader}>{header}</td>
      <td className={styles.mapSamples}>{samples.filter(Boolean).slice(0, 3).join(', ') || '—'}</td>
      <td>
        <select
          className={styles.mapSelect}
          value={value}
          onChange={e => onChange(header, e.target.value)}
        >
          <option value="">— Skip —</option>
          {IMPORTABLE_FIELDS.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
      </td>
    </tr>
  )
}

function PreviewTable({ headers, rows, mapping }) {
  const mappedCols = headers.filter(h => mapping[h])
  if (mappedCols.length === 0) return null
  const PREVIEW_COUNT = 8

  return (
    <div className={styles.previewWrap}>
      <h3 className={styles.previewHeading}>
        Preview <span className={styles.previewCount}>(first {Math.min(rows.length, PREVIEW_COUNT)} of {rows.length} rows)</span>
      </h3>
      <div className={styles.previewScroll}>
        <table className={styles.previewTable}>
          <thead>
            <tr>
              {mappedCols.map(h => <th key={h}>{IMPORTABLE_MAP[mapping[h]]?.label ?? mapping[h]}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, PREVIEW_COUNT).map((row, i) => (
              <tr key={i}>
                {mappedCols.map(h => {
                  const colIdx = headers.indexOf(h)
                  const transformed = transformValue(row[colIdx], mapping[h])
                  return <td key={h}>{transformed == null ? <span className={styles.nullVal}>null</span> : String(transformed)}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function Import() {
  const [step, setStep]         = useState('upload')   // upload | map | result
  const [csvData, setCsvData]   = useState(null)
  const [mapping, setMapping]   = useState({})
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult]     = useState(null)
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  function handleParsed(data) {
    const initialMapping = {}
    data.headers.forEach(h => { initialMapping[h] = autoMap(h) })
    setMapping(initialMapping)
    setCsvData(data)
    setStep('map')
  }

  function handleMappingChange(header, fieldKey) {
    setMapping(prev => ({ ...prev, [header]: fieldKey }))
  }

  const mappedCount = csvData
    ? Object.values(mapping).filter(Boolean).length
    : 0

  async function handleImport() {
    const records = csvData.rows.map(row =>
      buildRecord(row, csvData.headers, mapping)
    )

    setImporting(true)
    setProgress({ done: 0, total: records.length })

    const { inserted, errors } = await bulkInsertCertificates(records, (done, total) => {
      setProgress({ done, total })
    })

    // Attach raw rows to errors for CSV download
    const enrichedErrors = errors.map(e => ({
      ...e,
      rawRow: csvData.rows[e.index - 1],
    }))

    setResult({ inserted, errors: enrichedErrors })
    setImporting(false)
    setStep('result')
  }

  function handleReset() {
    setCsvData(null)
    setMapping({})
    setResult(null)
    setProgress({ done: 0, total: 0 })
    setStep('upload')
  }

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Import Certificates</h1>

      {/* Stepper */}
      <div className={styles.stepper}>
        {['upload', 'map', 'result'].map((s, i) => (
          <div key={s} className={`${styles.stepItem} ${step === s ? styles.stepActive : ''} ${['map','result'].slice(['upload','map','result'].indexOf(s)).includes(step) || step === 'result' ? styles.stepDone : ''}`}>
            <div className={styles.stepDot}>{i + 1}</div>
            <span className={styles.stepLabel}>{['Upload', 'Map Columns', 'Result'][i]}</span>
            {i < 2 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      {/* Upload */}
      {step === 'upload' && (
        <StepUpload onParsed={handleParsed} dragOver={dragOver} setDragOver={setDragOver} />
      )}

      {/* Map + Preview */}
      {step === 'map' && csvData && (
        <div>
          <div className={styles.mapInfo}>
            Detected <strong>{csvData.headers.length}</strong> columns and{' '}
            <strong>{csvData.rows.length}</strong> rows.{' '}
            Map each CSV column to a certificate field, or skip it.
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.mapTable}>
              <thead>
                <tr>
                  <th>CSV Column</th>
                  <th>Sample Values</th>
                  <th>Maps To</th>
                </tr>
              </thead>
              <tbody>
                {csvData.headers.map(header => (
                  <MappingRow
                    key={header}
                    header={header}
                    samples={csvData.rows.slice(0, 5).map(r => r[csvData.headers.indexOf(header)])}
                    value={mapping[header] ?? ''}
                    onChange={handleMappingChange}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <PreviewTable headers={csvData.headers} rows={csvData.rows} mapping={mapping} />

          <div className={styles.mapActions}>
            <button className={styles.btnSecondary} onClick={handleReset}>← Back</button>
            <button
              className={styles.btnPrimary}
              onClick={handleImport}
              disabled={mappedCount === 0 || importing}
            >
              {importing
                ? `Importing… ${progress.done}/${progress.total}`
                : `Import ${csvData.rows.length} records`}
            </button>
          </div>

          {importing && (
            <div className={styles.progressWrap}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.progressLabel}>{pct}%</span>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {step === 'result' && result && (
        <div>
          <div className={result.errors.length === 0 ? styles.successBanner : styles.partialBanner}>
            {result.errors.length === 0
              ? `✓ All ${result.inserted} records imported successfully.`
              : `✓ ${result.inserted} imported — ${result.errors.length} failed.`}
          </div>

          {result.errors.length > 0 && (
            <>
              <div className={styles.errorHeader}>
                <h2 className={styles.errorTitle}>Failed rows</h2>
                <button
                  className={styles.btnSecondary}
                  onClick={() => downloadErrorCSV(result.errors, csvData.headers)}
                >
                  Download errors as CSV
                </button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.errorTable}>
                  <thead>
                    <tr>
                      <th>Row #</th>
                      <th>Error</th>
                      {csvData.headers.map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, i) => (
                      <tr key={i}>
                        <td>{e.index}</td>
                        <td className={styles.errorMsg}>{e.message}</td>
                        {csvData.headers.map((h, j) => (
                          <td key={h}>{e.rawRow?.[j] ?? ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className={styles.mapActions}>
            <button className={styles.btnPrimary} onClick={handleReset}>Import another file</button>
          </div>
        </div>
      )}
    </div>
  )
}
