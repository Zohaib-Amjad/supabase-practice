create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text default '',
  created_at timestamptz default now() not null
);

alter table public.notes enable row level security;
create policy "Users can read their own notes" on public.notes for select using (auth.uid() = user_id);
create policy "Users can create their own notes" on public.notes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own notes" on public.notes for delete using (auth.uid() = user_id);
insert into storage.buckets (id, name, public) values ('practice-files', 'practice-files', false) on conflict (id) do nothing;
create policy "Users can upload their own files" on storage.objects for insert to authenticated with check (bucket_id = 'practice-files' and (storage.foldername(name))[1] = (select auth.uid()::text));
alter publication supabase_realtime add table public.notes;
