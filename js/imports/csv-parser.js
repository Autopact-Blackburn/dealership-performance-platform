export function parseDelimitedText(text) {
  const rows = String(text || '').trim().split(/\r?\n/).map(line => line.split(/\t|,/));
  const headers = rows.shift() || [];
  return { headers, rows };
}
