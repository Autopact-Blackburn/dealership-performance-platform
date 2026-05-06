import { supabase } from '../shared/api.js';

export async function fetchManualBonusesByPeriod(periodId) {
  const { data, error } = await supabase
    .from('salesperson_monthly_metrics')
    .select('salesperson_name, manual_bonus_total')
    .eq('period_id', periodId);

  if (error) {
    return { ok: false, data: [], error };
  }
  return { ok: true, data: data || [], error: null };
}

export async function fetchRawImportRowsForPeriod(periodId) {
  const { data, error } = await supabase
    .from('raw_import_rows')
    .select('import_type, row_data')
    .eq('period_id', periodId);

  if (error) {
    return { ok: false, error, rows: [] };
  }
  return { ok: true, rows: data || [] };
}

/**
 * Omits generated column real_gp.
 */
export async function upsertMasterDealsForPeriod(periodId, records) {
  if (!records.length) {
    return { ok: true, count: 0 };
  }

  const now = new Date().toISOString();
  const payload = records.map(r => ({
    period_id: periodId,
    deal_number: r.deal_number,
    salesperson_name: r.salesperson_name,
    customer_name: r.customer_name,
    vehicle_description: r.vehicle_description,
    processed_gross: r.processed_gross,
    am_gross: r.am_gross,
    accessory_gp: r.accessory_gp,
    finance_dealer_finance: r.finance_dealer_finance,
    finance_total_income: r.finance_total_income,
    aftercare_total_aftermarket: r.aftercare_total_aftermarket,
    has_trade_in: r.has_trade_in,
    direct_purchase_count: r.direct_purchase_count,
    updated_at: now
  }));

  const { error } = await supabase.from('master_deals').upsert(payload, {
    onConflict: 'period_id,deal_number'
  });

  if (error) {
    return { ok: false, error };
  }
  return { ok: true, count: payload.length };
}

export async function upsertSalespersonMetricsForPeriod(periodId, enrichedRows) {
  if (!enrichedRows.length) {
    return { ok: true, count: 0 };
  }

  const now = new Date().toISOString();
  const payload = enrichedRows.map(m => ({
    period_id: periodId,
    staff_id: null,
    salesperson_name: m.salesperson,
    units: m.units,
    signups: m.signups ?? 0,
    real_gp: m.realGp,
    accessory_gp: m.accessoryGp,
    finance_penetration: m.financePenetration,
    finance_ipur: m.financeIpur,
    aftercare_ppv: m.aftercarePpv,
    trade_in_penetration: 0,
    google_reviews: m.googleReviews ?? 0,
    nps: m.nps,
    dah: m.dah,
    direct_purchases: m.directPurchases,
    calculated_commission: m.calculatedCommission ?? 0,
    manual_bonus_total: m.manualBonuses ?? 0,
    final_commission: m.finalCommission ?? 0,
    generated_at: now
  }));

  const { error } = await supabase
    .from('salesperson_monthly_metrics')
    .upsert(payload, { onConflict: 'period_id,salesperson_name' });

  if (error) {
    return { ok: false, error };
  }
  return { ok: true, count: payload.length };
}
