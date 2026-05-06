import { normaliseHeader } from './utils.js';

export const HEADER_ALIASES = {
  dealNumber: ['deal #', 'deal no', 'deal number', 'deal'],
  salesperson: ['sales person', 'salesperson', 'sales consultant', 'consultant'],
  processedGross: ['processed gross', 'gross', 'deal gross'],
  amGross: ['am gross', 'am - gross', 'aftermarket gross'],
  saleAmount: ['sale amount', 'sales amount', 'amount sold'],
  costAmount: ['cost amount', 'cost', 'product cost'],
  dealerFinance: ['dealer finance', 'finance yes no', 'financed'],
  totalIncome: ['total income', 'finance income', 'income'],
  totalAftermarket: ['total aftermarket', 'aftermarket total', 'aftercare total'],
  tradeIn: ['trade in', 'trade-in', 'has trade'],
  customerName: ['customer name', 'client name'],
  vehicleDescription: ['vehicle', 'vehicle description', 'model'],
  nps: ['nps', 'net promoter', 'net promoter score'],
  dah: ['dah'],
  googleReviews: ['google reviews', 'google review', 'reviews', 'review count']
};

/** Keys recognised for alias mapping (used when normalising paste imports). */
export const CANONICAL_FIELD_KEYS = Object.keys(HEADER_ALIASES);

export function findColumnIndex(headers, fieldKey) {
  const aliases = HEADER_ALIASES[fieldKey] || [];
  const normalised = headers.map(normaliseHeader);
  return normalised.findIndex(header => aliases.some(alias => header === normaliseHeader(alias) || header.includes(normaliseHeader(alias))));
}

export function mapRow(headers, row, fieldKeys) {
  const output = {};
  for (const key of fieldKeys) {
    const idx = findColumnIndex(headers, key);
    output[key] = idx >= 0 ? row[idx] : null;
  }
  return output;
}
