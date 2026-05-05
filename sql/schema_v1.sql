-- Dealership Commissions + AI Coaching Platform
-- Supabase Postgres schema draft v1

create extension if not exists pgcrypto;

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  role text not null default 'salesperson' check (role in ('salesperson', 'manager', 'admin')),
  active boolean not null default true,
  commission_eligible boolean not null default true,
  eligible_from date,
  start_date date,
  team text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.commission_periods (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  period_month int not null check (period_month between 1 and 12),
  period_year int not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'finalized', 'archived')),
  created_at timestamptz default now(),
  finalized_at timestamptz
);

create table if not exists public.raw_import_batches (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references public.commission_periods(id) on delete cascade,
  import_type text not null check (import_type in ('signups', 'deal_log', 'accessories', 'finance', 'aftercare', 'leads', 'reviews')),
  source_filename text,
  uploaded_by uuid references public.staff(id),
  row_count int default 0,
  created_at timestamptz default now()
);

create table if not exists public.raw_import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.raw_import_batches(id) on delete cascade,
  period_id uuid references public.commission_periods(id) on delete cascade,
  import_type text not null,
  row_number int,
  row_data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.master_deals (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references public.commission_periods(id) on delete cascade,
  deal_number text not null,
  salesperson_name text,
  staff_id uuid references public.staff(id),
  customer_name text,
  vehicle_description text,
  processed_gross numeric default 0,
  am_gross numeric default 0,
  real_gp numeric generated always as (coalesce(processed_gross,0) - coalesce(am_gross,0)) stored,
  accessory_gp numeric default 0,
  finance_dealer_finance boolean default false,
  finance_total_income numeric default 0,
  aftercare_total_aftermarket numeric default 0,
  has_trade_in boolean default false,
  direct_purchase_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(period_id, deal_number)
);

create table if not exists public.deal_adjustments (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references public.commission_periods(id) on delete cascade,
  deal_number text not null,
  adjustment_type text not null check (adjustment_type in ('gross_override', 'exclude_deal', 'manager_note')),
  adjusted_gross numeric,
  reason text,
  adjusted_by uuid references public.staff(id),
  created_at timestamptz default now()
);

create table if not exists public.commission_rules (
  id uuid primary key default gen_random_uuid(),
  rule_key text not null,
  label text not null,
  category text not null,
  rule_type text not null,
  threshold numeric,
  payout_amount numeric,
  payout_rate numeric,
  active boolean default true,
  effective_from date,
  effective_to date,
  config jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.manual_bonuses (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references public.commission_periods(id) on delete cascade,
  staff_id uuid references public.staff(id),
  amount numeric not null,
  reason text,
  approved_by uuid references public.staff(id),
  created_at timestamptz default now()
);

create table if not exists public.salesperson_monthly_metrics (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references public.commission_periods(id) on delete cascade,
  staff_id uuid references public.staff(id),
  salesperson_name text,
  units int default 0,
  signups int default 0,
  real_gp numeric default 0,
  accessory_gp numeric default 0,
  finance_penetration numeric default 0,
  finance_ipur numeric default 0,
  aftercare_ppv numeric default 0,
  trade_in_penetration numeric default 0,
  google_reviews int default 0,
  nps numeric,
  dah numeric,
  direct_purchases int default 0,
  calculated_commission numeric default 0,
  manual_bonus_total numeric default 0,
  final_commission numeric default 0,
  generated_at timestamptz default now(),
  unique(period_id, staff_id)
);

create table if not exists public.ai_reviews (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references public.commission_periods(id) on delete cascade,
  staff_id uuid references public.staff(id),
  audience text not null check (audience in ('manager', 'salesperson')),
  strengths jsonb default '[]'::jsonb,
  opportunities jsonb default '[]'::jsonb,
  focus_areas jsonb default '[]'::jsonb,
  summary text,
  generated_at timestamptz default now(),
  unique(period_id, staff_id, audience)
);

-- Starter rules
insert into public.commission_rules (rule_key, label, category, rule_type, threshold, payout_amount, payout_rate, config)
values
('base_unit_rate', 'Base Unit Rate', 'unit', 'per_unit', null, 100, null, '{}'),
('volume_unlock_12', 'Volume Unlock 12-14', 'volume', 'bonus_pool_unlock', 12, null, 0.25, '{"max_units":14}'),
('volume_unlock_15', 'Volume Unlock 15-17', 'volume', 'bonus_pool_unlock', 15, null, 0.75, '{"max_units":17}'),
('volume_unlock_18', 'Volume Unlock 18+', 'volume', 'bonus_pool_unlock', 18, null, 1.0, '{}'),
('direct_purchase_bonus', 'Direct Purchase Bonus', 'direct_purchase', 'per_unit', null, 150, null, '{"requires_paperwork":true}')
on conflict do nothing;
