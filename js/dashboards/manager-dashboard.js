import { money, percent } from '../shared/utils.js';
import { localInsightFallback } from '../ai/ai-insights.js';
import {
  fetchCommissionPeriods,
  fetchMetricsForPeriod,
  fetchMasterDealCountForPeriod
} from './dashboard-data-service.js';
import { viewModelFromMetricsRow } from './metrics-view-model.js';

const PERIOD_STORAGE_KEY = 'dpp.selectedPeriodId';

const periodSelect = document.querySelector('#periodSelect');
const summaryCards = document.querySelector('#summaryCards');
const teamRows = document.querySelector('#teamRows');
const statusBanner = document.querySelector('#dashboardStatus');

function setStatus(message, kind = 'info') {
  if (!statusBanner) return;
  statusBanner.textContent = message || '';
  statusBanner.dataset.kind = kind;
  statusBanner.hidden = !message;
}

function persistPeriodId(id) {
  try {
    if (id) localStorage.setItem(PERIOD_STORAGE_KEY, id);
  } catch (_) {
    /* ignore */
  }
}

function loadPersistedPeriodId() {
  try {
    return localStorage.getItem(PERIOD_STORAGE_KEY);
  } catch (_) {
    return null;
  }
}

function renderCards(rows, dealCount) {
  if (!summaryCards) return;

  if (!rows.length) {
    summaryCards.innerHTML = `
      <article class="metric-card metric-card--wide">
        <div class="label">No team metrics</div>
        <div class="value value--text">Import data and run normalization for this period.</div>
      </article>`;
    return;
  }

  const totalComm = rows.reduce((sum, r) => sum + r.finalCommission, 0);
  const totalUnits = rows.reduce((sum, r) => sum + r.units, 0);
  const avgFinance =
    rows.reduce((sum, r) => sum + r.financePenetration, 0) / rows.length;
  const top = [...rows].sort((a, b) => b.finalCommission - a.finalCommission)[0];

  const cards = [
    ['Team commission', money(totalComm)],
    ['Units sold', String(totalUnits)],
    ['Finance pen.', percent(avgFinance)],
    ['Top performer', top.salesperson],
    ['Deals in period', String(dealCount ?? '—')]
  ];

  summaryCards.innerHTML = cards
    .map(
      ([label, value]) =>
        `<article class="metric-card"><div class="label">${label}</div><div class="value">${value}</div></article>`
    )
    .join('');
}

function renderRows(rows) {
  if (!teamRows) return;

  if (!rows.length) {
    teamRows.innerHTML = `<tr><td colspan="7" class="muted">No rows for this period.</td></tr>`;
    return;
  }

  teamRows.innerHTML = rows
    .map(
      (r, index) => `
    <tr>
      <td>${r.salesperson}</td>
      <td>${r.units}</td>
      <td>${percent(r.financePenetration)}</td>
      <td>${money(r.aftercarePpv)}</td>
      <td>${money(r.accessoryGp)}</td>
      <td>${money(r.finalCommission)}</td>
      <td><button type="button" class="button secondary review-btn" data-index="${index}">Review</button></td>
    </tr>`
    )
    .join('');

  document.querySelectorAll('.review-btn').forEach(btn => {
    btn.addEventListener('click', () =>
      openReview(rows[Number(btn.dataset.index)])
    );
  });
}

function openReview(row) {
  const insight = localInsightFallback(row);
  document.querySelector('#reviewTitle').textContent = `${row.salesperson} review`;
  document.querySelector('#reviewBody').innerHTML = `
    <div class="review-grid">
      <div class="review-box"><h3>Strengths</h3><ul>${insight.strengths.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="review-box"><h3>Opportunities</h3><ul>${insight.opportunities.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="review-box"><h3>Top 3 focus areas</h3><ol>${insight.focusAreas.map(x => `<li>${x}</li>`).join('')}</ol></div>
    </div>
    <div class="review-box"><h3>Manager PSP summary</h3><p>${insight.managerSummary}</p></div>
  `;
  document.querySelector('#reviewModal').showModal();
}

async function loadPeriodsIntoSelect() {
  setStatus('Loading periods…', 'info');
  const res = await fetchCommissionPeriods();
  if (!res.ok) {
    setStatus(res.error?.message || 'Could not load commission periods.', 'error');
    return null;
  }

  const persisted = loadPersistedPeriodId();
  periodSelect.innerHTML = res.data
    .map(
      p => `<option value="${p.id}">${escapeHtml(p.label)}</option>`
    )
    .join('');

  if (!res.data.length) {
    setStatus('Create a commission period in Supabase to continue.', 'warn');
    return null;
  }

  const selectedId = res.data.some(p => p.id === persisted)
    ? persisted
    : res.data[0].id;
  periodSelect.value = selectedId;
  setStatus('');
  persistPeriodId(selectedId);
  return selectedId;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadDashboard(periodId) {
  if (!periodId) return;

  setStatus('Loading metrics…', 'info');
  const [metricsRes, dealsRes] = await Promise.all([
    fetchMetricsForPeriod(periodId),
    fetchMasterDealCountForPeriod(periodId)
  ]);

  if (!metricsRes.ok) {
    setStatus(metricsRes.error?.message || 'Could not load metrics.', 'error');
    renderCards([], 0);
    renderRows([]);
    return;
  }

  const rows = metricsRes.data.map(viewModelFromMetricsRow);
  const dealCount = dealsRes.ok ? dealsRes.count : null;

  setStatus('');
  renderCards(rows, dealCount);
  renderRows(rows);
}

document.querySelector('#closeReview').addEventListener('click', () => {
  document.querySelector('#reviewModal').close();
});

periodSelect.addEventListener('change', () => {
  const id = periodSelect.value;
  persistPeriodId(id);
  loadDashboard(id);
});

(async function init() {
  const periodId = await loadPeriodsIntoSelect();
  await loadDashboard(periodId);
})();
