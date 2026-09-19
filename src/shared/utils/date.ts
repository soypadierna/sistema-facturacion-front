export function formatDate(s: string | null): string {
  if (!s) return '-';
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return '-';
  return `${d}/${m}/${y}`;
}
