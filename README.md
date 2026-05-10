# star-cert-crm

React + Vite CRM starter with Tailwind CSS v4 and Supabase.

## Setup

```bash
npm install
cp .env.example .env          # fill in your Supabase credentials
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Deploy to Netlify

1. Connect this repo in the Netlify dashboard.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Site settings → Environment variables**.
3. Netlify will use `netlify.toml` for build settings automatically.
