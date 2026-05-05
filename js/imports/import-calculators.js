import { mapRow } from '../shared/header-mapping.js';
import { toNumber } from '../shared/utils.js';

export function normaliseSignUps(headers, rows) {
  return rows.map(row => mapRow(headers, row, ['dealNumber', 'salesperson']));
}

export function normaliseDealLog(headers, rows) {
  return rows.map(row => {
    const mapped = mapRow(headers, row, ['dealNumber', 'salesperson', 'processedGross', 'amGross', 'customerName', 'vehicleDescription']);
    const processedGross = toNumber(mapped.processedGross);
    const amGross = toNumber(mapped.amGross);
    return { ...mapped, processedGross, amGross, realGp: processedGross - amGross };
  });
}

export function normaliseAccessories(headers, rows) {
  return rows.map(row => {
    const mapped = mapRow(headers, row, ['dealNumber', 'salesperson', 'saleAmount', 'costAmount']);
    const saleAmount = toNumber(mapped.saleAmount);
    const costAmount = toNumber(mapped.costAmount);
    return { ...mapped, saleAmount, costAmount, accessoryGp: saleAmount - costAmount };
  });
}

export function normaliseFinance(headers, rows) {
  return rows.map(row => {
    const mapped = mapRow(headers, row, ['dealNumber', 'salesperson', 'dealerFinance', 'totalIncome']);
    const dealerFinance = String(mapped.dealerFinance || '').toLowerCase();
    return {
      ...mapped,
      isDealerFinance: ['yes', 'y', 'true', '1', 'dealer finance'].some(v => dealerFinance.includes(v)),
      totalIncome: toNumber(mapped.totalIncome)
    };
  });
}

export function normaliseAftercare(headers, rows) {
  return rows.map(row => {
    const mapped = mapRow(headers, row, ['dealNumber', 'salesperson', 'totalAftermarket']);
    return { ...mapped, totalAftermarket: toNumber(mapped.totalAftermarket) };
  });
}
