# Tuition Payment Tracker

A React + Vite app for tracking student tuition payments, backed by Supabase for auth and data storage, styled with Tailwind CSS.

## Stack

- React 19 + Vite
- React Router for client-side routing
- Supabase (Postgres + Auth)
- Tailwind CSS v4

## Folder structure

```
src/
  components/
    auth/            AuthForm
    layout/          Navbar, AppLayout
    students/        StudentForm, StudentList
    lessons/         LessonForm, LessonList
    payment-cycles/  PaymentCycleForm, PaymentCycleList
    RequireAuth.jsx
  hooks/             useAuth, useStudents, useLessons, usePaymentCycles
  lib/               supabase client, tutor provisioning, format helpers
  pages/             Login, Dashboard, Students, Lessons, PaymentCycles
  App.jsx
  main.jsx
supabase/
  migrations/        SQL migrations (tutors, students, lessons, payment_cycles + RLS)
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your Supabase project URL and anon key.
3. Run the SQL in `supabase/migrations/` against your Supabase project (via the SQL editor or `supabase db push`).
4. Start the dev server:
   ```
   npm run dev
   ```

## Data model

- **tutors**: `id` (= `auth.users.id`), name, email — one row per tutor account
- **students**: tutor_id, name, guardian_email, monthly_fee
- **lessons**: student_id, tutor_id, lesson_date, duration_minutes, rate, status (`scheduled` | `completed` | `cancelled`), notes
- **payment_cycles**: student_id, tutor_id, period_start, period_end, amount_due, amount_paid, due_date, status (`pending` | `paid` | `overdue`), paid_at

Row-level security on every table scopes reads/writes to `tutor_id = auth.uid()` (or `id = auth.uid()` for `tutors`), so each tutor only ever sees their own students, lessons, and payment cycles.
