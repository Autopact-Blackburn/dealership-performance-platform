import { runPeriodNormalization } from './run-period-normalization.js';

const btn = document.querySelector('#runNormalizationBtn');
const periodInput = document.querySelector('#normalizationPeriodId');
const resultsEl = document.querySelector('#importResults');

function showNormalizationResult(message, type = 'success') {
  if (!resultsEl) return;
  const card = document.createElement('div');
  card.className = 'result-card';
  card.style.marginBottom = '12px';
  card.style.borderLeft =
    type === 'error' ? '6px solid #dc2626' : '6px solid #16a34a';
  card.innerHTML = `
    <strong>${type === 'error' ? 'Normalization error' : 'Normalization'}</strong>
    <br>
    ${message}
  `;
  resultsEl.prepend(card);
}

if (btn && periodInput) {
  btn.addEventListener('click', async () => {
    const periodId = periodInput.value.trim();
    if (!periodId) {
      showNormalizationResult('Enter a commission period ID (UUID).', 'error');
      return;
    }

    btn.disabled = true;
    const result = await runPeriodNormalization(periodId);
    btn.disabled = false;

    if (!result.ok) {
      showNormalizationResult(
        `${result.stage}: ${result.error?.message || 'Request failed'}`,
        'error'
      );
      return;
    }

    showNormalizationResult(
      `Upserted ${result.masterDealCount} master deals and ${result.metricsCount} salesperson metric rows.`
    );
  });
}
