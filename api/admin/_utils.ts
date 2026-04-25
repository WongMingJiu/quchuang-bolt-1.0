export type AdminTimeRange = 'today' | '24h' | '7d' | '30d' | '60d';

export interface ResolvedTimeRange {
  startAt: string;
  endAt: string;
}

function startOfToday(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function resolveTimeRange(range: AdminTimeRange): ResolvedTimeRange {
  const now = new Date();
  let start = new Date(now);

  switch (range) {
    case 'today':
      start = startOfToday(now);
      break;
    case '24h':
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '60d':
      start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      break;
    default:
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
  }

  return {
    startAt: start.toISOString(),
    endAt: now.toISOString(),
  };
}
