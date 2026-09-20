create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null default 'admin' check (role in ('admin','manager','counselor','teacher','staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  module_name text not null,
  can_view boolean not null default false,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  created_at timestamptz not null default now(),
  unique (role, module_name)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  student_code text not null unique,
  grade_level text not null,
  section text,
  status text not null default 'active',
  advisor_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.counseling_cases (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  case_type text not null,
  priority text not null default 'medium',
  status text not null default 'open',
  notes text,
  assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.school_calendar (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.operational_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  owner_id uuid references public.profiles(id),
  due_date date,
  status text not null default 'planned',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('whatsapp','sms','email')),
  recipient_type text not null,
  recipient_value text not null,
  subject text,
  body text not null,
  sent_by uuid references public.profiles(id),
  sent_at timestamptz not null default now(),
  status text not null default 'queued'
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  report_name text not null,
  report_type text not null,
  generated_by uuid references public.profiles(id),
  generated_at timestamptz not null default now(),
  file_url text,
  summary jsonb default '{}'::jsonb
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid,
  action text not null,
  actor_id uuid references public.profiles(id),
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger students_set_updated_at
before update on public.students
for each row execute procedure public.set_updated_at();

create trigger counseling_cases_set_updated_at
before update on public.counseling_cases
for each row execute procedure public.set_updated_at();

create trigger school_calendar_set_updated_at
before update on public.school_calendar
for each row execute procedure public.set_updated_at();

create trigger operational_plans_set_updated_at
before update on public.operational_plans
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.permissions enable row level security;
alter table public.students enable row level security;
alter table public.counseling_cases enable row level security;
alter table public.school_calendar enable row level security;
alter table public.operational_plans enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "profiles_admin_manage"
on public.profiles
for insert with check (public.is_admin());
create policy "profiles_admin_delete"
on public.profiles
for delete using (public.is_admin());

create policy "permissions_read_allowed"
on public.permissions
for select
using (public.is_admin() or auth.role() = 'authenticated');

create policy "permissions_manage_admin"
on public.permissions
for all
using (public.is_admin())
with check (public.is_admin());

create policy "students_access"
on public.students
for all
using (public.is_admin() or auth.role() = 'authenticated')
with check (public.is_admin() or auth.role() = 'authenticated');

create policy "counseling_access"
on public.counseling_cases
for all
using (public.is_admin() or auth.role() = 'authenticated')
with check (public.is_admin() or auth.role() = 'authenticated');

create policy "calendar_access"
on public.school_calendar
for all
using (public.is_admin() or auth.role() = 'authenticated')
with check (public.is_admin() or auth.role() = 'authenticated');

create policy "plan_access"
on public.operational_plans
for all
using (public.is_admin() or auth.role() = 'authenticated')
with check (public.is_admin() or auth.role() = 'authenticated');

create policy "messages_access"
on public.messages
for all
using (public.is_admin() or auth.role() = 'authenticated')
with check (public.is_admin() or auth.role() = 'authenticated');

create policy "reports_access"
on public.reports
for all
using (public.is_admin() or auth.role() = 'authenticated')
with check (public.is_admin() or auth.role() = 'authenticated');

create policy "audit_logs_access"
on public.audit_logs
for select
using (public.is_admin() or auth.role() = 'authenticated');

insert into public.permissions (role, module_name, can_view, can_edit, can_delete)
values
  ('admin', 'dashboard', true, true, true),
  ('admin', 'students', true, true, true),
  ('admin', 'counseling', true, true, true),
  ('admin', 'calendar', true, true, true),
  ('admin', 'plan', true, true, true),
  ('admin', 'messages', true, true, true),
  ('admin', 'reports', true, true, true),
  ('admin', 'settings', true, true, true),
  ('manager', 'dashboard', true, true, false),
  ('manager', 'students', true, true, false),
  ('manager', 'reports', true, false, false),
  ('teacher', 'students', true, false, false),
  ('teacher', 'calendar', true, false, false),
  ('staff', 'messages', true, false, false)
on conflict (role, module_name) do nothing;
