export function buildSalespersonMetrics(deals = []) {
  const byPerson = new Map();

  for (const deal of deals) {
    const name = deal.salesperson || 'Unassigned';
    if (!byPerson.has(name)) {
      byPerson.set(name, {
        salesperson: name,
        units: 0,
        realGp: 0,
        accessoryGp: 0,
        financeDeals: 0,
        financeIncome: 0,
        aftercareIncome: 0,
        directPurchases: 0
      });
    }

    const m = byPerson.get(name);
    m.units += 1;
    m.realGp += Number(deal.realGp || 0);
    m.accessoryGp += Number(deal.accessoryGp || 0);
    if (deal.isDealerFinance) m.financeDeals += 1;
    m.financeIncome += Number(deal.totalIncome || 0);
    m.aftercareIncome += Number(deal.totalAftermarket || 0);
    m.directPurchases += Number(deal.directPurchases || 0);
  }

  return [...byPerson.values()].map(m => ({
    ...m,
    financePenetration: m.units ? m.financeDeals / m.units : 0,
    financeIpur: m.units ? m.financeIncome / m.units : 0,
    aftercarePpv: m.units ? m.aftercareIncome / m.units : 0
  }));
}
