-- Rows exist but the REST client returns none when RLS has no permissive SELECT.
-- Apply in Supabase → SQL Editor (once per project).

alter table public.commission_periods enable row level security;

drop policy if exists commission_periods_select_dashboard on public.commission_periods;

create policy commission_periods_select_dashboard
  on public.commission_periods
  for select
  to anon, authenticated
  using (true);
