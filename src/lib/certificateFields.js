export const CERTIFICATE_FIELDS = [
  { key: 'name',            label: 'Name',           type: 'text',   required: true },
  { key: 'gender',          label: 'Gender',          type: 'select', options: ['Male', 'Female', 'Other'] },
  { key: 'dob',             label: 'Date of Birth',   type: 'date' },
  { key: 'organisation',    label: 'Organisation',    type: 'text' },
  { key: 'group',           label: 'Group',           type: 'text' },
  { key: 'cert_serial_no',  label: 'Serial No.',      type: 'text' },
  { key: 'course_date',     label: 'Course Date',     type: 'date' },
  { key: 'level_of_award',  label: 'Level of Award',  type: 'select', options: ['CP1', 'One Star', 'Two Star', 'Three Star'] },
  { key: 'assessor',        label: 'Assessor',        type: 'text' },
  { key: 'instructor_cert', label: 'Instructor Cert', type: 'text' },
  { key: 'receipt_no',      label: 'Receipt No.',     type: 'text' },
  { key: 'sheet',           label: 'Sheet',           type: 'text' },
]

export const FIELD_SECTIONS = [
  { title: 'Personal',       keys: ['name', 'gender', 'dob'] },
  { title: 'Organisation',   keys: ['organisation', 'group'] },
  { title: 'Course',         keys: ['cert_serial_no', 'course_date', 'level_of_award', 'assessor', 'instructor_cert'] },
  { title: 'Administrative', keys: ['receipt_no', 'sheet'] },
]

export const FIELD_MAP = Object.fromEntries(CERTIFICATE_FIELDS.map(f => [f.key, f]))
