/**
 * Maps DB row (snake_case) to camelCase for UI + AI helpers.
 * Commission dollars always come from the database.
 */
export function viewModelFromMetricsRow(dbRow) {
  return {
    salesperson: dbRow.salesperson_name || 'Unassigned',
    units: Number(dbRow.units) || 0,
    signups: Number(dbRow.signups) || 0,
    financePenetration: Number(dbRow.finance_penetration) || 0,
    aftercarePpv: Number(dbRow.aftercare_ppv) || 0,
    accessoryGp: Number(dbRow.accessory_gp) || 0,
    realGp: Number(dbRow.real_gp) || 0,
    financeIpur: Number(dbRow.finance_ipur) || 0,
    directPurchases: Number(dbRow.direct_purchases) || 0,
    finalCommission: Number(dbRow.final_commission) || 0,
    calculatedCommission: Number(dbRow.calculated_commission) || 0,
    googleReviews: Number(dbRow.google_reviews) || 0,
    nps: dbRow.nps != null ? Number(dbRow.nps) : null,
    dah: dbRow.dah != null ? Number(dbRow.dah) : null
  };
}
