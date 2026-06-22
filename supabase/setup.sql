-- ============================================================
-- Aria CRM — full database setup
-- Paste this entire script into the Supabase SQL Editor and run.
-- Safe to re-run: all statements use IF NOT EXISTS / OR REPLACE.
-- ============================================================


-- ── 1. Table ─────────────────────────────────────────────────

create table if not exists certificates (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  gender          text,
  dob             date,
  organisation    text,
  "group"         text,
  cert_serial_no  text        unique,
  course_date     date,
  level_of_award  text,
  assessor        text,
  instructor_cert text,
  receipt_no      text,
  sheet           text,
  voided          boolean     not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ── 2. updated_at trigger ────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists certificates_set_updated_at on certificates;

create trigger certificates_set_updated_at
  before update on certificates
  for each row execute function set_updated_at();


-- ── 3. Full-text search column + indexes ─────────────────────

alter table certificates
  add column if not exists name_fts tsvector
    generated always as (to_tsvector('english', coalesce(name, ''))) stored;

create index if not exists certificates_name_fts_idx
  on certificates using gin (name_fts);

create index if not exists certificates_cert_serial_no_idx
  on certificates (cert_serial_no);


-- ── 4. Row Level Security ────────────────────────────────────

alter table certificates enable row level security;

-- Drop any previous policies to start clean
drop policy if exists "Authenticated users can read certificates" on certificates;
drop policy if exists "Anyone can read certificates"              on certificates;
drop policy if exists "Authenticated users can insert"           on certificates;
drop policy if exists "Authenticated users can update"           on certificates;

-- Public read — search page is open without a login
create policy "Anyone can read certificates"
  on certificates for select
  using (true);

-- Authenticated write — Admin form, CSV import, edit, void/unvoid
create policy "Authenticated users can insert"
  on certificates for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update"
  on certificates for update
  to authenticated
  using (true)
  with check (true);
