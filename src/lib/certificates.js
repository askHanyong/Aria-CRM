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

// Searches name via full-text (GIN index) and cert_serial_no via prefix match.
// Returns up to `limit` non-voided results.
export async function searchCertificates(query, limit = 50) {
  const trimmed = query.trim()
  if (!trimmed) return []

  // cert_serial_no: ilike prefix match
  // name: postgres full-text via the generated name_fts column
  const { data, error } = await supabase
    .from('certificates')
    .select('id, name, gender, dob, organisation, group, cert_serial_no, course_date, level_of_award, assessor, instructor_cert, receipt_no, sheet, voided')
    .or(`name_fts.fts.${trimmed.split(/\s+/).join(' & ')},cert_serial_no.ilike.${trimmed}%`)
    .eq('voided', false)
    .order('name')
    .limit(limit)

  if (error) throw error
  return data
}
