-- Tutors: one row per authenticated tutor, keyed by their auth.users id.
create table if not exists tutors (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Students: each student belongs to exactly one tutor.
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references tutors (id) on delete cascade,
  name text not null,
  guardian_email text,
  monthly_fee numeric(10, 2),
  created_at timestamptz not null default now()
);

-- Lessons: individual sessions delivered to a student.
-- tutor_id is denormalized from students.tutor_id to keep RLS checks single-table lookups.
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  tutor_id uuid not null references tutors (id) on delete cascade,
  lesson_date date not null,
  duration_minutes integer not null check (duration_minutes > 0),
  rate numeric(10, 2) not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

-- Payment cycles: a billing period (e.g. monthly) for a student, tracking what's owed/paid.
create table if not exists payment_cycles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  tutor_id uuid not null references tutors (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  amount_due numeric(10, 2) not null,
  amount_paid numeric(10, 2) not null default 0,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  constraint payment_cycles_period_valid check (period_end >= period_start)
);

create index if not exists students_tutor_id_idx on students (tutor_id);
create index if not exists lessons_student_id_idx on lessons (student_id);
create index if not exists lessons_tutor_id_idx on lessons (tutor_id);
create index if not exists payment_cycles_student_id_idx on payment_cycles (student_id);
create index if not exists payment_cycles_tutor_id_idx on payment_cycles (tutor_id);
create index if not exists payment_cycles_status_idx on payment_cycles (status);

alter table tutors enable row level security;
alter table students enable row level security;
alter table lessons enable row level security;
alter table payment_cycles enable row level security;

-- Tutors can only see and manage their own tutor row.
create policy "Tutors can read own row"
  on tutors for select
  to authenticated
  using (id = auth.uid());

create policy "Tutors can insert own row"
  on tutors for insert
  to authenticated
  with check (id = auth.uid());

create policy "Tutors can update own row"
  on tutors for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Tutors can delete own row"
  on tutors for delete
  to authenticated
  using (id = auth.uid());

-- Students: scoped to the owning tutor.
create policy "Tutors can read own students"
  on students for select
  to authenticated
  using (tutor_id = auth.uid());

create policy "Tutors can insert own students"
  on students for insert
  to authenticated
  with check (tutor_id = auth.uid());

create policy "Tutors can update own students"
  on students for update
  to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy "Tutors can delete own students"
  on students for delete
  to authenticated
  using (tutor_id = auth.uid());

-- Lessons: scoped to the owning tutor.
create policy "Tutors can read own lessons"
  on lessons for select
  to authenticated
  using (tutor_id = auth.uid());

create policy "Tutors can insert own lessons"
  on lessons for insert
  to authenticated
  with check (tutor_id = auth.uid());

create policy "Tutors can update own lessons"
  on lessons for update
  to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy "Tutors can delete own lessons"
  on lessons for delete
  to authenticated
  using (tutor_id = auth.uid());

-- Payment cycles: scoped to the owning tutor.
create policy "Tutors can read own payment cycles"
  on payment_cycles for select
  to authenticated
  using (tutor_id = auth.uid());

create policy "Tutors can insert own payment cycles"
  on payment_cycles for insert
  to authenticated
  with check (tutor_id = auth.uid());

create policy "Tutors can update own payment cycles"
  on payment_cycles for update
  to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

create policy "Tutors can delete own payment cycles"
  on payment_cycles for delete
  to authenticated
  using (tutor_id = auth.uid());
