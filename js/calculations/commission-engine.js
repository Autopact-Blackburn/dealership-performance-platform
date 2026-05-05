import { defaultRules, getVolumeUnlockRate } from './rules-engine.js';

export function calculateCommission(metrics, rules = defaultRules) {
  const units = Number(metrics.units || 0);
  const bonusPool = Number(metrics.bonusPool || 0);
  const directPurchases = Number(metrics.directPurchases || 0);
  const manualBonuses = Number(metrics.manualBonuses || 0);
  const eligible = metrics.commissionEligible !== false;

  if (!eligible) {
    return {
      baseCommission: 0,
      unlockedBonusPool: 0,
      directPurchaseBonus: 0,
      manualBonuses,
      finalCommission: manualBonuses,
      volumeUnlockRate: 0,
      note: 'Not commission eligible for this period.'
    };
  }

  const volumeUnlockRate = getVolumeUnlockRate(units, rules);
  const baseCommission = units * rules.baseUnitRate;
  const unlockedBonusPool = bonusPool * volumeUnlockRate;
  const directPurchaseBonus = directPurchases * rules.directPurchaseBonus;
  const finalCommission = baseCommission + unlockedBonusPool + directPurchaseBonus + manualBonuses;

  return { baseCommission, unlockedBonusPool, directPurchaseBonus, manualBonuses, finalCommission, volumeUnlockRate };
}
