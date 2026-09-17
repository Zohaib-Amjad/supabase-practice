# Supabase Lab

A focused practice app for Auth, Postgres CRUD, Storage, Row Level Security, and Realtime.

## Run it

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key from Project Settings > API.
4. Run `npm run dev`.

Without environment variables, the app stays in local demo mode so the UI can still be explored.

## Practice path

- Create an account and inspect Auth users.
- Add, read, and delete notes; then inspect the `notes` table.
- Change the RLS policies and test access with a second account.
- Upload a file and inspect the private `practice-files` bucket.
- Open the app in two tabs and watch Realtime updates.
