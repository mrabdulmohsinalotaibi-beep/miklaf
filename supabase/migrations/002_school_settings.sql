create table if not exists public.school_settings (
  id text primary key,
  school_name text not null,
  school_code text not null default '',
  education_type text not null default 'التعليم العام',
  city text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  principal_name text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create or replace function public.school_settings_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

create trigger school_settings_set_updated_at
before update on public.school_settings
for each row execute procedure public.school_settings_set_updated_at();

alter table public.school_settings enable row level security;
create policy "school_settings_authenticated_read"
on public.school_settings for select
using (auth.role() = 'authenticated');
create policy "school_settings_authenticated_write"
on public.school_settings for insert
with check (auth.role() = 'authenticated');
create policy "school_settings_authenticated_update"
on public.school_settings for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

insert into public.school_settings (id, school_name, school_code, education_type, city, principal_name)
values ('default-school', 'الثانوية النموذجية', 'SCH-001', 'التعليم العام', 'الرياض', 'محمد العتيبي')
on conflict (id) do nothing;
