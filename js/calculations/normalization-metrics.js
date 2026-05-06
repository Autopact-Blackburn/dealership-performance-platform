import { buildSalespersonMetrics } from './metrics-engine.js';
import { toNumber } from '../shared/utils.js';

export function countSignupsBySalesperson(signupRowDataList) {
  const m = new Map();
  for (const row of signupRowDataList) {
    const name =
      (row.salesperson && String(row.salesperson).trim()) || 'Unassigned';
    m.set(name, (m.get(name) || 0) + 1);
  }
  return m;
}

export function aggregateReviewsBySalesperson(reviewRowDataList) {
  const m = new Map();
  for (const row of reviewRowDataList) {
    const name =
      (row.salesperson && String(row.salesperson).trim()) || 'Unassigned';
    if (!m.has(name)) {
      m.set(name, { googleReviews: 0, nps: null, dah: null });
    }
    const agg = m.get(name);
    if (row.googleReviews != null && row.googleReviews !== '') {
      agg.googleReviews += toNumber(row.googleReviews);
    }
    if (row.nps != null && row.nps !== '') agg.nps = toNumber(row.nps);
    if (row.dah != null && row.dah !== '') agg.dah = toNumber(row.dah);
  }
  return m;
}

function emptyMetricRow(name, signups, rev) {
  const r = rev || { googleReviews: 0, nps: null, dah: null };
  return {
    salesperson: name,
    units: 0,
    realGp: 0,
    accessoryGp: 0,
    financeDeals: 0,
    financeIncome: 0,
    aftercareIncome: 0,
    directPurchases: 0,
    financePenetration: 0,
    financeIpur: 0,
    aftercarePpv: 0,
    signups: signups || 0,
    googleReviews: r.googleReviews,
    nps: r.nps,
    dah: r.dah
  };
}

/**
 * Deal-level KPIs from buildSalespersonMetrics; signups/reviews merged without duplicating formulas.
 */
export function enrichSalespersonMetrics(
  dealsForMetrics,
  signupRowDataList,
  reviewRowDataList
) {
  const signupsMap = countSignupsBySalesperson(signupRowDataList || []);
  const reviewsMap = aggregateReviewsBySalesperson(reviewRowDataList || []);
  const base = buildSalespersonMetrics(dealsForMetrics);

  const byName = new Map(
    base.map(m => [
      m.salesperson,
      {
        ...m,
        signups: signupsMap.get(m.salesperson) || 0,
        googleReviews: 0,
        nps: null,
        dah: null
      }
    ])
  );

  for (const [name, count] of signupsMap) {
    if (!byName.has(name)) {
      byName.set(name, emptyMetricRow(name, count, null));
    }
  }

  for (const [name, r] of reviewsMap) {
    if (!byName.has(name)) {
      byName.set(
        name,
        emptyMetricRow(name, signupsMap.get(name) || 0, r)
      );
    } else {
      const x = byName.get(name);
      x.googleReviews = r.googleReviews;
      x.nps = r.nps;
      x.dah = r.dah;
    }
  }

  return [...byName.values()];
}
