export function getStartOfDay(dateString?: string): Date {
  const d = dateString ? new Date(dateString) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function getStartOfWeek(dateString?: string): Date {
  const d = dateString ? new Date(dateString) : new Date();
  const day = d.getUTCDay();
  // Set start of week to Monday. If Sunday (day 0), subtract 6 days. Else subtract day - 1.
  const diff = d.getUTCDate() - (day === 0 ? 6 : day - 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function getStartOfMonth(dateString?: string): Date {
  const d = dateString ? new Date(dateString) : new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function getDaysAgo(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}
