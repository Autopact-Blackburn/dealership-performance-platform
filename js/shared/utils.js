export function normaliseHeader(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = String(value).replace(/[$,%\s,]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function money(value) {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(value || 0);
}

export function percent(value) {
  return `${Math.round((value || 0) * 100)}%`;
}
