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
