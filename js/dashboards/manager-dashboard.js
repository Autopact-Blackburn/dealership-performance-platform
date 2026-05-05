import { money, percent } from '../shared/utils.js';
import { calculateCommission } from '../calculations/commission-engine.js';
import { localInsightFallback } from '../ai/ai-insights.js';

const demoRows = [
  { salesperson: 'David', units: 18, bonusPool: 3200, directPurchases: 2, financePenetration: .61, aftercarePpv: 1240, accessoryGp: 4200 },
  { salesperson: 'Sarah', units: 15, bonusPool: 2600, directPurchases: 1, financePenetration: .54, aftercarePpv: 980, accessoryGp: 3100 },
  { salesperson: 'Michael', units: 11, bonusPool: 2100, directPurchases: 0, financePenetration: .49, aftercarePpv: 820, accessoryGp: 1800 }
].map(row => ({ ...row, commission: calculateCommission(row).finalCommission }));

function renderCards(rows) {
  const totalComm = rows.reduce((sum, r) => sum + r.commission, 0);
  const totalUnits = rows.reduce((sum, r) => sum + r.units, 0);
  const avgFinance = rows.reduce((sum, r) => sum + r.financePenetration, 0) / rows.length;
  const top = [...rows].sort((a,b) => b.commission - a.commission)[0];

  document.querySelector('#summaryCards').innerHTML = [
    ['Team Commission', money(totalComm)],
    ['Units Sold', totalUnits],
    ['Finance Pen.', percent(avgFinance)],
    ['Top Performer', top.salesperson]
  ].map(([label, value]) => `<article class="metric-card"><div class="label">${label}</div><div class="value">${value}</div></article>`).join('');
}

function renderRows(rows) {
  document.querySelector('#teamRows').innerHTML = rows.map((r, index) => `
    <tr>
      <td>${r.salesperson}</td>
      <td>${r.units}</td>
      <td>${percent(r.financePenetration)}</td>
      <td>${money(r.aftercarePpv)}</td>
      <td>${money(r.accessoryGp)}</td>
      <td>${money(r.commission)}</td>
      <td><button class="button secondary review-btn" data-index="${index}">Review</button></td>
    </tr>
  `).join('');

  document.querySelectorAll('.review-btn').forEach(btn => {
    btn.addEventListener('click', () => openReview(rows[Number(btn.dataset.index)]));
  });
}

function openReview(row) {
  const insight = localInsightFallback(row);
  document.querySelector('#reviewTitle').textContent = `${row.salesperson} Review`;
  document.querySelector('#reviewBody').innerHTML = `
    <div class="review-grid">
      <div class="review-box"><h3>Strengths</h3><ul>${insight.strengths.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="review-box"><h3>Opportunities</h3><ul>${insight.opportunities.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="review-box"><h3>Top 3 Focus Areas</h3><ol>${insight.focusAreas.map(x => `<li>${x}</li>`).join('')}</ol></div>
    </div>
    <div class="review-box"><h3>Manager PSP Summary</h3><p>${insight.managerSummary}</p></div>
  `;
  document.querySelector('#reviewModal').showModal();
}

document.querySelector('#closeReview').addEventListener('click', () => document.querySelector('#reviewModal').close());
renderCards(demoRows);
renderRows(demoRows);
