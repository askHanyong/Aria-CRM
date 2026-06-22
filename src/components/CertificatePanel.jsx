import { useState, useEffect } from 'react'
import { updateCertificate } from '../lib/certificates'
import { CERTIFICATE_FIELDS, FIELD_SECTIONS, FIELD_MAP } from '../lib/certificateFields'
import styles from './CertificatePanel.module.css'

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function FieldInput({ field, value, onChange }) {
  const common = { className: styles.editInput, id: field.key }
  if (field.type === 'select') {
    return (
      <select {...common} value={value ?? ''} onChange={e => onChange(field.key, e.target.value)}>
        <option value="">—</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  return (
    <input
      {...common}
      type={field.type}
      value={value ?? ''}
      required={field.required}
      onChange={e => onChange(field.key, e.target.value)}
    />
  )
}

export default function CertificatePanel({ cert, onClose, onUpdate }) {
  const [localCert, setLocalCert]   = useState(cert)
  const [isEditing, setIsEditing]   = useState(false)
  const [formData, setFormData]     = useState({})
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState(null)

  useEffect(() => { setLocalCert(cert) }, [cert])

  useEffect(() => {
    function onKey(e) {
      if (e.key !== 'Escape') return
      if (isEditing) setIsEditing(false)
      else onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isEditing, onClose])

  function startEdit() {
    const data = {}
    CERTIFICATE_FIELDS.forEach(f => { data[f.key] = localCert[f.key] ?? '' })
    setFormData(data)
    setSaveError(null)
    setIsEditing(true)
  }

  function handleFieldChange(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await updateCertificate(localCert.id, formData)
      setLocalCert(updated)
      onUpdate?.(updated)
      setIsEditing(false)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className={styles.backdrop} onClick={isEditing ? undefined : onClose} />
      <aside className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.serial}>{localCert.cert_serial_no ?? '—'}</p>
            <h2 className={styles.panelName}>{localCert.name}</h2>
          </div>
          <div className={styles.headerRight}>
            {localCert.voided && <span className={styles.voidedBadge}>Voided</span>}
            {!isEditing && (
              <button className={styles.editBtn} onClick={startEdit}>Edit</button>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className={styles.panelBody}>
          {isEditing ? (
            <>
              {FIELD_SECTIONS.map(section => (
                <section key={section.title} className={styles.section}>
                  <h3 className={styles.sectionTitle}>{section.title}</h3>
                  {section.keys.map(key => {
                    const field = FIELD_MAP[key]
                    return (
                      <div key={key} className={styles.editRow}>
                        <label htmlFor={field.key} className={styles.editLabel}>
                          {field.label}{field.required && <span className={styles.req}> *</span>}
                        </label>
                        <FieldInput field={field} value={formData[key]} onChange={handleFieldChange} />
                      </div>
                    )
                  })}
                </section>
              ))}
              {saveError && <p className={styles.saveError}>{saveError}</p>}
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                <button className={styles.cancelBtn} onClick={() => setIsEditing(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            FIELD_SECTIONS.map(section => (
              <section key={section.title} className={styles.section}>
                <h3 className={styles.sectionTitle}>{section.title}</h3>
                <dl className={styles.dl}>
                  {section.keys.map(key => {
                    const field = FIELD_MAP[key]
                    const val = localCert[key]
                    return (
                      <div key={key} className={styles.row}>
                        <dt className={styles.dt}>{field.label}</dt>
                        <dd className={styles.dd}>
                          {field.type === 'date' ? formatDate(val) : (val ?? '—')}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </section>
            ))
          )}
        </div>
      </aside>
    </>
  )
}
