create extension if not exists "pgcrypto";

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  parent_pin_hash text not null,
  parent_telegram_chat_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  display_name text not null,
  age int not null,
  avatar_seed text not null,
  avatar_style text not null default 'adventurer',
  grade_band text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  key text unique not null,
  name text not null,
  grade_band text not null,
  standard_code text
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  skill_id uuid not null references public.skills(id),
  title text not null,
  lesson_type text not null,
  content jsonb not null,
  status text not null default 'approved',
  created_by text not null default 'seed',
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id),
  skill_id uuid not null references public.skills(id),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  duration_ms int,
  response jsonb not null,
  is_correct boolean not null,
  ai_feedback jsonb,
  ai_grade_model text,
  parent_approved_at timestamptz,
  parent_approved_by uuid
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  attempt_id uuid references public.attempts(id) on delete set null,
  amount int not null,
  type text not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  description text,
  token_cost int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.tutor_logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid references public.skills(id),
  user_message text not null,
  assistant_message text not null,
  model text not null,
  token_count int,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  title text not null,
  description text not null,
  earned_at timestamptz not null default now()
);

create or replace function public.current_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.households
  where parent_user_id = auth.uid()
  limit 1;
$$;

revoke all on function public.current_household_id() from public;
grant execute on function public.current_household_id() to authenticated;

alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.attempts enable row level security;
alter table public.transactions enable row level security;
alter table public.rewards enable row level security;
alter table public.tutor_logs enable row level security;
alter table public.achievements enable row level security;

create policy "households owner full access" on public.households
for all
using (parent_user_id = auth.uid())
with check (parent_user_id = auth.uid());

create policy "profiles household full access" on public.profiles
for all
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "lessons household full access" on public.lessons
for all
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "attempts household full access" on public.attempts
for all
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "transactions household full access" on public.transactions
for all
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "rewards household full access" on public.rewards
for all
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "tutor logs household full access" on public.tutor_logs
for all
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

create policy "achievements household full access" on public.achievements
for all
using (household_id = public.current_household_id())
with check (household_id = public.current_household_id());

alter table public.subjects enable row level security;
alter table public.skills enable row level security;

create policy "subjects readable by authenticated" on public.subjects
for select
using (auth.role() = 'authenticated');

create policy "skills readable by authenticated" on public.skills
for select
using (auth.role() = 'authenticated');
