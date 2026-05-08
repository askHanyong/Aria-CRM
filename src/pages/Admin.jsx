import { useState } from 'react'
import { createCertificate } from '../lib/certificates'
import { CERTIFICATE_FIELDS, FIELD_SECTIONS, FIELD_MAP } from '../lib/certificateFields'
import styles from './Admin.module.css'

const EMPTY_FORM = Object.fromEntries(CERTIFICATE_FIELDS.map(f => [f.key, '']))

function FieldInput({ field, value, onChange }) {
  const common = { id: field.key, className: styles.input }
  if (field.type === 'select') {
    return (
      <select {...common} value={value} onChange={e => onChange(field.key, e.target.value)}>
        <option value="">— Select —</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  return (
    <input
      {...common}
      type={field.type}
      value={value}
      required={field.required}
      onChange={e => onChange(field.key, e.target.value)}
    />
  )
}

export default function Admin() {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(null)

  function handleChange(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }))
    if (success) setSuccess(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    // strip empty strings to null so the DB gets clean nulls
    const payload = Object.fromEntries(
      Object.entries(formData).map(([k, v]) => [k, v === '' ? null : v])
    )
    try {
      const created = await createCertificate(payload)
      setSuccess(`Certificate "${created.name}" (${created.cert_serial_no ?? 'no serial'}) added successfully.`)
      setFormData(EMPTY_FORM)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Add Certificate</h1>

      {success && (
        <div className={styles.successBanner}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {FIELD_SECTIONS.map(section => (
          <fieldset key={section.title} className={styles.fieldset}>
            <legend className={styles.legend}>{section.title}</legend>
            <div className={styles.grid}>
              {section.keys.map(key => {
                const field = FIELD_MAP[key]
                return (
                  <div key={key} className={styles.field}>
                    <label htmlFor={field.key} className={styles.label}>
                      {field.label}
                      {field.required && <span className={styles.req}> *</span>}
                    </label>
                    <FieldInput field={field} value={formData[key]} onChange={handleChange} />
                  </div>
                )
              })}
            </div>
          </fieldset>
        ))}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? 'Saving…' : 'Add Certificate'}
          </button>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => { setFormData(EMPTY_FORM); setError(null); setSuccess(null) }}
            disabled={submitting}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
