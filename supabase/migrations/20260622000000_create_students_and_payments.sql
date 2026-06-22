create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  guardian_email text,
  monthly_fee numeric(10, 2),
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  amount numeric(10, 2) not null,
  due_date date not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  paid_at timestamptz,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index if not exists payments_student_id_idx on payments (student_id);
create index if not exists payments_status_idx on payments (status);

alter table students enable row level security;
alter table payments enable row level security;

create policy "Authenticated users can read students"
  on students for select
  to authenticated
  using (true);

create policy "Authenticated users can manage students"
  on students for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can read payments"
  on payments for select
  to authenticated
  using (true);

create policy "Authenticated users can manage payments"
  on payments for all
  to authenticated
  using (true)
  with check (true);
