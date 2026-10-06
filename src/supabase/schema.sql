-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Areas Table
create table if not exists public.areas (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  "desc" text default '',
  color text default '#2f80ed',
  position double precision default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks Table
create table if not exists public.tasks (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  area_id text not null,
  title text not null,
  description text default '',
  status text not null check (status in ('added', 'doing', 'blocked', 'done')),
  date text,
  time text,
  priority text default 'Normalny' check (priority in ('Normalny', 'Wysoki', 'Pilny')),
  position double precision default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.areas enable row level security;
alter table public.tasks enable row level security;

-- Drop old policies if exist
drop policy if exists "Allow full access for all users" on public.areas;
drop policy if exists "Allow full access for all users" on public.tasks;
drop policy if exists "Users can view their own areas" on public.areas;
drop policy if exists "Users can insert their own areas" on public.areas;
drop policy if exists "Users can update their own areas" on public.areas;
drop policy if exists "Users can delete their own areas" on public.areas;
drop policy if exists "Users can view their own tasks" on public.tasks;
drop policy if exists "Users can insert their own tasks" on public.tasks;
drop policy if exists "Users can update their own tasks" on public.tasks;
drop policy if exists "Users can delete their own tasks" on public.tasks;

-- Create Permissive RLS Policies allowing full read/write access for app clients
create policy "Allow full access for all users"
  on public.areas for all
  using (true)
  with check (true);

create policy "Allow full access for all users"
  on public.tasks for all
  using (true)
  with check (true);

-- Grant privileges to anon and authenticated roles
grant all on table public.areas to anon, authenticated, service_role;
grant all on table public.tasks to anon, authenticated, service_role;

-- Enable Realtime for live cross-device sync
alter publication supabase_realtime add table public.areas;
alter publication supabase_realtime add table public.tasks;
