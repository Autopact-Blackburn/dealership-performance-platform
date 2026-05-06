-- Enables upsert on (period_id, salesperson_name) when staff_id is not yet resolved.
-- Apply in Supabase SQL editor before using normalization metrics persistence.

create unique index if not exists ux_salesperson_monthly_metrics_period_salesperson_name
  on public.salesperson_monthly_metrics (period_id, salesperson_name);
