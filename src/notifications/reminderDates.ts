import { addDays, addMonths, getDate, getDay, getDaysInMonth, setDate, setDay } from 'date-fns';
import { Reminder } from '../../db/queries';

export type ReminderSchedule = Pick<Reminder, 'type' | 'interval' | 'dayOfWeek' | 'dayOfMonth'>;

export function computeNextReminder(
  reminderTime: Date,
  { type: mode, interval, dayOfWeek, dayOfMonth }: ReminderSchedule,
): Date {
  let nextOccurDate = new Date(reminderTime);

  if (mode === 'daily') {
    return addDays(nextOccurDate, interval);
  }

  if (mode === 'weekly') {
    let nextDate = addDays(nextOccurDate, 7 * interval);
    return setDay(nextDate, dayOfWeek ?? getDay(nextOccurDate));
  }

  const day = dayOfMonth ?? getDate(nextOccurDate);
  let shouldScheduleThisMonth = day > getDate(nextOccurDate);
  if (interval == 1 && shouldScheduleThisMonth) {
    return setDate(nextOccurDate, Math.min(day, getDaysInMonth(nextOccurDate)));
  }
  let nextDate = addMonths(nextOccurDate, interval);
  return setDate(nextDate, Math.min(day, getDaysInMonth(nextDate)));
}

export function computeReminderSchedule(
  reminderTime: Date,
  recurrence: ReminderSchedule,
  n: number,
): Date[] {
  let nextReminderTime = reminderTime;
  const result: Date[] = [];
  while (result.length < n) {
    nextReminderTime = computeNextReminder(nextReminderTime, recurrence);
    result.push(nextReminderTime);
  }
  return result;
}
