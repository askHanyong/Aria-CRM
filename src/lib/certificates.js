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
