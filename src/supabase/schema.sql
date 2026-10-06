-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Areas Table
create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  desc text default '',
  color text default '#2f80ed',
  position double precision default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks Table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
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

-- RLS Policies for Areas
create policy "Users can view their own areas"
  on public.areas for select
  using (auth.uid() = user_id or user_id is null);

create policy "Users can insert their own areas"
  on public.areas for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update their own areas"
  on public.areas for update
  using (auth.uid() = user_id or user_id is null);

create policy "Users can delete their own areas"
  on public.areas for delete
  using (auth.uid() = user_id or user_id is null);

-- RLS Policies for Tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id or user_id is null);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id or user_id is null);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id or user_id is null);

-- Enable Realtime for live cross-device sync
alter publication supabase_realtime add table public.areas;
alter publication supabase_realtime add table public.tasks;
