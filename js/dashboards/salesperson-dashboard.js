import { money, percent } from '../shared/utils.js';
import { supabase } from '../shared/api.js';
import { localInsightFallback } from '../ai/ai-insights.js';
import {
  fetchCommissionPeriods,
  fetchMetricsForPeriod,
  fetchStaffByAuthEmail
} from './dashboard-data-service.js';
import { viewModelFromMetricsRow } from './metrics-view-model.js';

const PERIOD_STORAGE_KEY = 'dpp.selectedPeriodId';

const periodSelect = document.querySelector('#periodSelect');
const personalSummary = document.querySelector('#personalSummary');
const focusAreas = document.querySelector('#focusAreas');
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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeName(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function pickMetricsRowForStaff(metricsData, staffFullName) {
  const target = normalizeName(staffFullName);
  const row = metricsData.find(
    r => normalizeName(r.salesperson_name) === target
  );
  return row || null;
}

function renderPersonal(row) {
  if (!personalSummary) return;

  if (!row) {
    personalSummary.innerHTML = `
      <article class="metric-card metric-card--wide">
        <div class="label">Your results</div>
        <div class="value value--text">No metrics row matched your staff profile for this period.</div>
      </article>`;
    if (focusAreas) focusAreas.innerHTML = '';
    return;
  }

  const vm = viewModelFromMetricsRow(row);
  const insight = localInsightFallback(vm);

  personalSummary.innerHTML = [
    ['Published commission', money(vm.finalCommission)],
    ['Units', String(vm.units)],
    ['Finance pen.', percent(vm.financePenetration)],
    ['Aftercare PPV', money(vm.aftercarePpv)],
    ['Accessory GP', money(vm.accessoryGp)]
  ]
    .map(
      ([label, value]) =>
        `<article class="metric-card"><div class="label">${label}</div><div class="value">${value}</div></article>`
    )
    .join('');

  if (focusAreas) {
    focusAreas.innerHTML = insight.focusAreas.map(x => `<li>${x}</li>`).join('');
  }
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
    setStatus(
      'No periods returned from the database. Add a commission_periods row—or if one already exists, add a permissive SELECT RLS policy for anon/authenticated (see sql/migrations/003_rls_commission_periods_select.sql).',
      'warn'
    );
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

async function loadMyMetrics(periodId, staff) {
  if (!periodId) return;

  setStatus('Loading your metrics…', 'info');
  const res = await fetchMetricsForPeriod(periodId);
  if (!res.ok) {
    setStatus(res.error?.message || 'Could not load metrics.', 'error');
    renderPersonal(null);
    return;
  }

  if (!staff) {
    setStatus('Sign in to view your published results.', 'warn');
    renderPersonal(null);
    return;
  }

  const row = pickMetricsRowForStaff(res.data, staff.full_name);
  setStatus('');
  renderPersonal(row);
}

periodSelect.addEventListener('change', () => {
  const id = periodSelect.value;
  persistPeriodId(id);
  initForPeriod(id);
});

let cachedStaff = null;

async function initForPeriod(periodId) {
  await loadMyMetrics(periodId, cachedStaff);
}

(async function init() {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session?.user?.email) {
    const staffRes = await fetchStaffByAuthEmail(session.user.email);
    if (staffRes.ok) {
      cachedStaff = staffRes.data;
    }
  }

  const periodId = await loadPeriodsIntoSelect();
  await initForPeriod(periodId);
})();
