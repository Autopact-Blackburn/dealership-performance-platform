import { groupRowDataByImportType, mergeDealLogAnchoredDeals } from '../calculations/normalization-merge.js';
import { enrichSalespersonMetrics } from '../calculations/normalization-metrics.js';
import { applyCommissionForPersistence } from '../calculations/normalization-commission.js';
import {
  fetchRawImportRowsForPeriod,
  fetchManualBonusesByPeriod,
  upsertMasterDealsForPeriod,
  upsertSalespersonMetricsForPeriod
} from './master-data-service.js';

const MERGE_ERRORS = {
  DEAL_LOG_REQUIRED: 'Deal Log import is required before normalization.'
};

/**
 * @param {string} periodId - commission_periods.id
 * @param {{ persist?: boolean }} options - default persist true
 */
export async function runPeriodNormalization(periodId, options = {}) {
  const persist = options.persist !== false;

  if (!periodId || !String(periodId).trim()) {
    return {
      ok: false,
      error: { message: 'periodId is required' },
      stage: 'validate'
    };
  }

  const fetchResult = await fetchRawImportRowsForPeriod(periodId);
  if (!fetchResult.ok) {
    return { ok: false, error: fetchResult.error, stage: 'fetch' };
  }

  const groups = groupRowDataByImportType(fetchResult.rows);
  const merged = mergeDealLogAnchoredDeals(groups);

  if (merged.error) {
    return {
      ok: false,
      error: { message: MERGE_ERRORS[merged.error] || merged.error },
      stage: 'merge'
    };
  }

  const enriched = enrichSalespersonMetrics(
    merged.dealsForMetrics,
    groups.signups,
    groups.reviews
  );

  let manualByName = new Map();
  if (persist) {
    const manualRes = await fetchManualBonusesByPeriod(periodId);
    if (manualRes.ok) {
      manualByName = new Map(
        manualRes.data.map(r => [
          r.salesperson_name,
          Number(r.manual_bonus_total) || 0
        ])
      );
    }
  }

  const enrichedWithManual = enriched.map(m => ({
    ...m,
    manualBonuses: manualByName.get(m.salesperson) ?? 0
  }));

  const enrichedWithCommission = applyCommissionForPersistence(
    enrichedWithManual
  );

  if (!persist) {
    return {
      ok: true,
      masterDeals: merged.masterDealsRecords,
      metrics: enrichedWithCommission,
      persisted: false
    };
  }

  const dealsRes = await upsertMasterDealsForPeriod(
    periodId,
    merged.masterDealsRecords
  );
  if (!dealsRes.ok) {
    return { ok: false, error: dealsRes.error, stage: 'persist_master_deals' };
  }

  const metricsRes = await upsertSalespersonMetricsForPeriod(
    periodId,
    enrichedWithCommission
  );
  if (!metricsRes.ok) {
    return { ok: false, error: metricsRes.error, stage: 'persist_metrics' };
  }

  return {
    ok: true,
    masterDealCount: dealsRes.count,
    metricsCount: metricsRes.count,
    persisted: true
  };
}
