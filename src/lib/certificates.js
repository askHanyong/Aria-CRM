import { supabase } from './supabase'

export async function getCertificates() {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getCertificateBySerial(certSerialNo) {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('cert_serial_no', certSerialNo)
    .single()
  if (error) throw error
  return data
}

export async function createCertificate(certificate) {
  const { data, error } = await supabase
    .from('certificates')
    .insert(certificate)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCertificate(id, updates) {
  const { data, error } = await supabase
    .from('certificates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function voidCertificate(id) {
  return updateCertificate(id, { voided: true })
}

export async function unvoidCertificate(id) {
  return updateCertificate(id, { voided: false })
}

// Inserts records in batches of 100. On a batch error, retries row-by-row
// so individual failures are identified. Calls onProgress(done, total) each batch.
export async function bulkInsertCertificates(records, onProgress) {
  const BATCH = 100
  let inserted = 0
  const errors = []

  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH)
    const { error } = await supabase.from('certificates').insert(batch)

    if (!error) {
      inserted += batch.length
    } else {
      // Retry row-by-row to pinpoint which rows actually fail
      for (let j = 0; j < batch.length; j++) {
        const { error: rowErr } = await supabase.from('certificates').insert(batch[j])
        if (rowErr) {
          errors.push({ index: i + j + 1, record: batch[j], message: rowErr.message })
        } else {
          inserted++
        }
      }
    }

    onProgress?.(Math.min(i + BATCH, records.length), records.length)
  }

  return { inserted, errors }
}

// Searches name via full-text (GIN index) and cert_serial_no via prefix match.
// options.levelOfAward — filter to a specific award level (null = all)
// options.voidedFilter — 'valid' | 'voided' | 'all'
export async function searchCertificates(query, options = {}, limit = 50) {
  const { levelOfAward = null, voidedFilter = 'valid' } = options
  const trimmed = query.trim()
  if (!trimmed) return []

  let q = supabase
    .from('certificates')
    .select('id, name, gender, dob, organisation, "group", cert_serial_no, course_date, level_of_award, assessor, instructor_cert, receipt_no, sheet, voided')
    .or(`name_fts.fts.${trimmed.split(/\s+/).join(' & ')},cert_serial_no.ilike.${trimmed}%`)

  if (voidedFilter === 'valid')  q = q.eq('voided', false)
  if (voidedFilter === 'voided') q = q.eq('voided', true)
  if (levelOfAward)              q = q.eq('level_of_award', levelOfAward)

  const { data, error } = await q.order('name').limit(limit)
  if (error) throw error
  return data
}
