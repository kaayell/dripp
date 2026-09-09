import { format, formatDistance, parseISO } from 'date-fns';

export function timeSince(dateString: string): string {
  const today = format(new Date(), 'yyyy-MM-dd');
  return formatDistance(parseISO(dateString), parseISO(today), { addSuffix: true });
}
