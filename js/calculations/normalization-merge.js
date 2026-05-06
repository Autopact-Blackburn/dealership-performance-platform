import { toNumber } from '../shared/utils.js';

export function normalizeDealNumber(value) {
  const s = String(value ?? '').trim();
  return s || null;
}

/**
 * @param {Array<{ import_type: string, row_data: object }>} rawRows
 */
export function groupRowDataByImportType(rawRows) {
  const groups = {};
  for (const row of rawRows) {
    const t = row.import_type;
    if (!groups[t]) groups[t] = [];
    groups[t].push(row.row_data);
  }
  return groups;
}

/**
 * Deal Log is required. Other import types attach only when deal_number matches the anchor set.
 * @returns {{ error: string | null, dealsForMetrics: object[], masterDealsRecords: object[] }}
 */
export function mergeDealLogAnchoredDeals(groups) {
  const dealLog = groups.deal_log;
  if (!dealLog || dealLog.length === 0) {
    return {
      error: 'DEAL_LOG_REQUIRED',
      dealsForMetrics: [],
      masterDealsRecords: []
    };
  }

  const byDeal = new Map();

  for (const row of dealLog) {
    const key = normalizeDealNumber(row.dealNumber);
    if (!key) continue;

    const processedGross = toNumber(row.processedGross);
    const amGross = toNumber(row.amGross);
    const realGp = Number.isFinite(Number(row.realGp))
      ? Number(row.realGp)
      : processedGross - amGross;

    byDeal.set(key, {
      deal_number: key,
      salesperson_name:
        row.salesperson != null && String(row.salesperson).trim()
          ? String(row.salesperson).trim()
          : null,
      customer_name:
        row.customerName != null ? String(row.customerName) : null,
      vehicle_description:
        row.vehicleDescription != null ? String(row.vehicleDescription) : null,
      processed_gross: processedGross,
      am_gross: amGross,
      accessory_gp: 0,
      finance_dealer_finance: false,
      finance_total_income: 0,
      aftercare_total_aftermarket: 0,
      has_trade_in: false,
      direct_purchase_count: 0,
      _realGp: realGp
    });
  }

  const anchor = new Set(byDeal.keys());

  const attach = (rows, fn) => {
    if (!rows) return;
    for (const row of rows) {
      const key = normalizeDealNumber(row.dealNumber);
      if (!anchor.has(key)) continue;
      fn(byDeal.get(key), row);
    }
  };

  attach(groups.accessories, (deal, row) => {
    deal.accessory_gp += toNumber(row.accessoryGp);
  });

  attach(groups.finance, (deal, row) => {
    deal.finance_dealer_finance = !!row.isDealerFinance;
    deal.finance_total_income = toNumber(row.totalIncome);
  });

  attach(groups.aftercare, (deal, row) => {
    deal.aftercare_total_aftermarket += toNumber(row.totalAftermarket);
  });

  const masterDealsRecords = [];
  const dealsForMetrics = [];

  for (const d of byDeal.values()) {
    masterDealsRecords.push({
      deal_number: d.deal_number,
      salesperson_name: d.salesperson_name,
      customer_name: d.customer_name,
      vehicle_description: d.vehicle_description,
      processed_gross: d.processed_gross,
      am_gross: d.am_gross,
      accessory_gp: d.accessory_gp,
      finance_dealer_finance: d.finance_dealer_finance,
      finance_total_income: d.finance_total_income,
      aftercare_total_aftermarket: d.aftercare_total_aftermarket,
      has_trade_in: d.has_trade_in,
      direct_purchase_count: d.direct_purchase_count
    });

    const sp = d.salesperson_name || 'Unassigned';
    dealsForMetrics.push({
      salesperson: sp,
      realGp: d._realGp,
      accessoryGp: d.accessory_gp,
      isDealerFinance: d.finance_dealer_finance,
      totalIncome: d.finance_total_income,
      totalAftermarket: d.aftercare_total_aftermarket,
      directPurchases: d.direct_purchase_count
    });
  }

  return {
    error: null,
    dealsForMetrics,
    masterDealsRecords
  };
}
