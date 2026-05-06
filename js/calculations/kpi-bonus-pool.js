/**
 * Derives a single KPI bonus pool (AUD-scale dollars) for commission-engine input.
 * Uses already-aggregated metrics only — does not recompute penetration, PPV, or IPUR.
 * Tune weights later via commission_rules / config; this is the one v1 aggregation point.
 */
export function deriveKpiBonusPool(enrichedMetricRow) {
  const units = Math.max(Number(enrichedMetricRow.units) || 0, 0);
  const accessory = Number(enrichedMetricRow.accessoryGp) || 0;
  const aftercarePpv = Number(enrichedMetricRow.aftercarePpv) || 0;
  const finPen = Number(enrichedMetricRow.financePenetration) || 0;
  const finIpur = Number(enrichedMetricRow.financeIpur) || 0;
  const google = Number(enrichedMetricRow.googleReviews) || 0;
  const nps = Number(enrichedMetricRow.nps) || 0;

  const fromAccessory = accessory * 0.35;
  const fromAftercare = aftercarePpv * Math.max(units, 1) * 0.28;
  const fromFinance = finPen * 1800 + Math.min(finIpur * Math.max(units, 1) * 0.12, 4200);
  const fromReviews = google * 40 + (nps > 0 ? nps * 8 : 0);

  return Math.round(
    fromAccessory + fromAftercare + fromFinance + fromReviews
  );
}
