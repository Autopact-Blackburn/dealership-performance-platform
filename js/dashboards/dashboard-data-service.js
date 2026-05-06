import { supabase } from '../shared/api.js';

const PERIODS_SELECT =
  'id,label,period_year,period_month,status';

export async function fetchCommissionPeriods() {
  const { data, error } = await supabase
    .from('commission_periods')
    .select(PERIODS_SELECT)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false });

  if (error) {
    return { ok: false, data: [], error };
  }
  return { ok: true, data: data || [], error: null };
}

export async function fetchMetricsForPeriod(periodId) {
  const { data, error } = await supabase
    .from('salesperson_monthly_metrics')
    .select('*')
    .eq('period_id', periodId);

  if (error) {
    return { ok: false, data: [], error };
  }
  return { ok: true, data: data || [], error: null };
}

export async function fetchMasterDealCountForPeriod(periodId) {
  const { count, error } = await supabase
    .from('master_deals')
    .select('id', { count: 'exact', head: true })
    .eq('period_id', periodId);

  if (error) {
    return { ok: false, count: 0, error };
  }
  return { ok: true, count: count ?? 0, error: null };
}

export async function fetchStaffByAuthEmail(email) {
  if (!email) {
    return { ok: true, data: null, error: null };
  }

  const normalized = String(email).trim().toLowerCase();
  const { data, error } = await supabase
    .from('staff')
    .select('id,full_name,email')
    .eq('email', normalized)
    .maybeSingle();

  if (error) {
    return { ok: false, data: null, error };
  }
  return { ok: true, data, error: null };
}
