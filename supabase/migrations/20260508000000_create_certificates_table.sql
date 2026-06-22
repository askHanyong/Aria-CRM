create table if not exists certificates (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  gender          text,
  dob             date,
  organisation    text,
  "group"         text,
  cert_serial_no  text unique,
  course_date     date,
  level_of_award  text,
  assessor        text,
  instructor_cert text,
  receipt_no      text,
  sheet           text,
  voided          boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- keep updated_at current on every row update
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger certificates_set_updated_at
before update on certificates
for each row execute function set_updated_at();

-- basic RLS: authenticated users can read; only service role can write
alter table certificates enable row level security;

create policy "Authenticated users can read certificates"
  on certificates for select
  to authenticated
  using (true);
