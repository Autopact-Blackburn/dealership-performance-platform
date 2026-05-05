export function localInsightFallback(metrics) {
  const focusAreas = [];
  if ((metrics.financePenetration || 0) < 0.55) focusAreas.push('Lift finance introductions and keep them consistent on every opportunity.');
  if ((metrics.aftercarePpv || 0) < 1000) focusAreas.push('Improve aftercare presentation quality and timing.');
  if ((metrics.accessoryGp || 0) < 1500) focusAreas.push('Look for earlier accessory conversations before delivery pressure builds.');

  while (focusAreas.length < 3) focusAreas.push('Maintain consistent follow-up rhythm and protect customer experience.');

  return {
    strengths: ['Strong contribution to the month with clear opportunities to keep building.'],
    opportunities: focusAreas,
    focusAreas: focusAreas.slice(0, 3),
    managerSummary: 'Use this review to reinforce the strongest behaviours and agree on three simple focus areas for next month.',
    salespersonSummary: 'You have a clear pathway to improve next month by focusing on the three actions below.'
  };
}
