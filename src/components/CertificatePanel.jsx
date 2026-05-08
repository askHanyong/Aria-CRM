import { useEffect } from 'react'
import styles from './CertificatePanel.module.css'

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const SECTIONS = [
  {
    title: 'Personal',
    fields: [
      { key: 'name',         label: 'Name' },
      { key: 'gender',       label: 'Gender' },
      { key: 'dob',          label: 'Date of Birth', format: formatDate },
    ],
  },
  {
    title: 'Organisation',
    fields: [
      { key: 'organisation', label: 'Organisation' },
      { key: 'group',        label: 'Group' },
    ],
  },
  {
    title: 'Course',
    fields: [
      { key: 'cert_serial_no',  label: 'Serial No.' },
      { key: 'course_date',     label: 'Course Date', format: formatDate },
      { key: 'level_of_award',  label: 'Level of Award' },
      { key: 'assessor',        label: 'Assessor' },
      { key: 'instructor_cert', label: 'Instructor Cert' },
    ],
  },
  {
    title: 'Administrative',
    fields: [
      { key: 'receipt_no', label: 'Receipt No.' },
      { key: 'sheet',      label: 'Sheet' },
    ],
  },
]

export default function CertificatePanel({ cert, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.serial}>{cert.cert_serial_no ?? '—'}</p>
            <h2 className={styles.panelName}>{cert.name}</h2>
          </div>
          <div className={styles.headerRight}>
            {cert.voided && <span className={styles.voidedBadge}>Voided</span>}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        <div className={styles.panelBody}>
          {SECTIONS.map(section => (
            <section key={section.title} className={styles.section}>
              <h3 className={styles.sectionTitle}>{section.title}</h3>
              <dl className={styles.dl}>
                {section.fields.map(({ key, label, format }) => (
                  <div key={key} className={styles.row}>
                    <dt className={styles.dt}>{label}</dt>
                    <dd className={styles.dd}>
                      {format ? format(cert[key]) : (cert[key] ?? '—')}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </aside>
    </>
  )
}
