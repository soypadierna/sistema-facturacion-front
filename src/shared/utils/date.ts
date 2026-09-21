export function formatDate(s: string | null): string {
  if (!s) return '-';
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return '-';
  return `${d}/${m}/${y}`;
}

export function todayLocalISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function firstOfMonthLocalISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}