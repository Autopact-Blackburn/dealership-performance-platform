export const defaultRules = {
  baseUnitRate: 100,
  directPurchaseBonus: 150,
  volumeUnlocks: [
    { minUnits: 18, rate: 1.00 },
    { minUnits: 15, rate: 0.75 },
    { minUnits: 12, rate: 0.25 },
    { minUnits: 0, rate: 0.00 }
  ]
};

export function getVolumeUnlockRate(units, rules = defaultRules) {
  const match = rules.volumeUnlocks.find(tier => units >= tier.minUnits);
  return match ? match.rate : 0;
}
