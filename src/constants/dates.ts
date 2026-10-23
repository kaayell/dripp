import {
  format,
  type FormatDistanceFn,
  formatDistanceStrict,
  type FormatDistanceToken,
  parse,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { enUS } from 'date-fns/locale';

export const WEEKDAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);
export enum DateFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}
const SHORT_UNITS: Partial<Record<FormatDistanceToken, string>> = {
  xSeconds: 's',
  xMinutes: 'm',
  xHours: 'h',
  xDays: 'd',
  xMonths: 'mo',
  xYears: 'y',
};

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

const formatShortDistance: FormatDistanceFn = (token, count, options) => {
  const value = `${count}${SHORT_UNITS[token] ?? ''}`;
  if (!options?.addSuffix) return value;
  return options.comparison && options.comparison > 0 ? `in ${value}` : `${value} ago`;
};

export function timeSince(dateString: string): string {
  const today = todayString();
  if (dateString === today) return 'today';
  return formatDistanceStrict(parseISO(dateString), parseISO(today), {
    addSuffix: true,
    locale: { ...enUS, formatDistance: formatShortDistance },
  });
}

export function startDatesForPastMonths(pastMonths: number): string[] {
  const currentMonth = startOfMonth(new Date());
  return Array.from({ length: pastMonths + 1 }, (_, i) =>
    formatForDisplay(subMonths(currentMonth, i)),
  );
}
