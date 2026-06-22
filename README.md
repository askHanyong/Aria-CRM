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
    auth/         AuthForm
    layout/        Navbar, AppLayout
    students/      StudentForm, StudentList
    payments/      PaymentForm, PaymentList
    RequireAuth.jsx
  hooks/           useAuth, useStudents, usePayments
  lib/             supabase client, format helpers
  pages/           Login, Dashboard, Students, Payments
  App.jsx
  main.jsx
supabase/
  migrations/      SQL migrations (students, payments tables + RLS)
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

- **students**: name, guardian_email, monthly_fee
- **payments**: student_id, amount, due_date, status (`pending` | `paid` | `overdue`), paid_at
