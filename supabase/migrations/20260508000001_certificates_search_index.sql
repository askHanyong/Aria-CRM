alter table certificates
  add column if not exists name_fts tsvector
    generated always as (to_tsvector('english', coalesce(name, ''))) stored;

create index if not exists certificates_name_fts_idx
  on certificates using gin (name_fts);

create index if not exists certificates_cert_serial_no_idx
  on certificates (cert_serial_no);
