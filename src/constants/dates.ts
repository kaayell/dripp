import { format, formatDistance, parse, parseISO, startOfMonth, subMonths } from 'date-fns';

export const WEEKDAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);
export enum DateFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export function parseTime(time: string): Date {
  return parse(time, 'HH:mm', new Date());
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDisplayTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function formatForDisplay(date: Date, formatStr = 'yyyy-MM-dd'): string {
  return format(date, formatStr);
}

export function todayString(): string {
  return formatForDisplay(new Date());
}

export function formatShortDate(date: Date): string {
  return format(date, 'EEE, MMM d');
}

export function timeSince(dateString: string): string {
  const today = todayString();
  if (dateString === today) return 'Today';
  return formatDistance(parseISO(dateString), parseISO(today), { addSuffix: true });
}

export function startDatesForPastMonths(pastMonths: number): string[] {
  const currentMonth = startOfMonth(new Date());
  return Array.from({ length: pastMonths + 1 }, (_, i) =>
    formatForDisplay(subMonths(currentMonth, i)),
  );
}
