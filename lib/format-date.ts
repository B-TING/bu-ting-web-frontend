const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function formatDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr);
  return WEEKDAYS_KO[date.getDay()];
}

export function diffDaysInclusive(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
