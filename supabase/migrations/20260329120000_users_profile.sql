-- Run in Supabase SQL editor or via CLI. Profile row keyed to auth.users.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  goal text,
  checkin_time text,
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
