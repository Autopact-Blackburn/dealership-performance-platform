import { calculateCommission } from './commission-engine.js';
import { deriveKpiBonusPool } from './kpi-bonus-pool.js';

/**
 * Applies commission-engine once per salesperson row before persistence.
 * Dashboards read calculated_commission / final_commission from DB only.
 */
export function applyCommissionForPersistence(enrichedRows) {
  return enrichedRows.map(m => {
    const bonusPool = deriveKpiBonusPool(m);
    const c = calculateCommission({
      units: m.units,
      bonusPool,
      directPurchases: m.directPurchases,
      manualBonuses: Number(m.manualBonuses) || 0,
      commissionEligible: m.commissionEligible !== false
    });

    const calculatedCommission =
      c.baseCommission + c.unlockedBonusPool + c.directPurchaseBonus;

    return {
      ...m,
      calculatedCommission,
      finalCommission: c.finalCommission
    };
  });
}
