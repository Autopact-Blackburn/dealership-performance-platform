import { money, percent } from '../shared/utils.js';
import { calculateCommission } from '../calculations/commission-engine.js';
import { localInsightFallback } from '../ai/ai-insights.js';

const myMetrics = {
  salesperson: 'David',
  units: 18,
  bonusPool: 3200,
  directPurchases: 2,
  financePenetration: .61,
  aftercarePpv: 1240,
  accessoryGp: 4200
};

const result = calculateCommission(myMetrics);
const insight = localInsightFallback(myMetrics);

document.querySelector('#personalSummary').innerHTML = [
  ['Previous Commission', money(result.finalCommission)],
  ['Units', myMetrics.units],
  ['Finance Pen.', percent(myMetrics.financePenetration)],
  ['Aftercare PPV', money(myMetrics.aftercarePpv)]
].map(([label, value]) => `<article class="metric-card"><div class="label">${label}</div><div class="value">${value}</div></article>`).join('');

document.querySelector('#focusAreas').innerHTML = insight.focusAreas.map(x => `<li>${x}</li>`).join('');

document.querySelector('#simulatorForm').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const sim = calculateCommission({
    units: Number(data.get('units')),
    bonusPool: Number(data.get('bonusPool')),
    directPurchases: Number(data.get('directPurchases'))
  });

  document.querySelector('#simulatorResult').innerHTML = `
    Theoretical Commission: ${money(sim.finalCommission)}
    <br><span class="muted">Volume unlock: ${Math.round(sim.volumeUnlockRate * 100)}%</span>
  `;
});
