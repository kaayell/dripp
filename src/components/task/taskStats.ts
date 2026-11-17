import { differenceInCalendarDays, parseISO } from 'date-fns';

export type TaskLogStat = {
  date: string;
  previousDate: string | null;
  gap: number | null;
};

export type TaskStats = {
  total: number;
  last30Days: number;
  lastYear: number;
  averageGapDays: number | null;
  logs: TaskLogStat[];
};

export function computeTaskStats(dates: string[], today: string): TaskStats {
  const days = [...new Set(dates)].sort();
  const todayDate = parseISO(today);

  const countWithin = (windowDays: number) =>
    days.filter((d) => {
      const ago = differenceInCalendarDays(todayDate, parseISO(d));
      return ago >= 0 && ago <= windowDays;
    }).length;

  const taskLogs: TaskLogStat[] = days
    .map((date, i) => {
      const previousDate = i > 0 ? days[i - 1] : null;
      return {
        date,
        previousDate,
        gap: previousDate ? differenceInCalendarDays(parseISO(date), parseISO(previousDate)) : null,
      };
    })
    .reverse();
  const gaps = taskLogs.map((log) => log.gap).filter((gap): gap is number => gap !== null);
  const averageGapDays =
    gaps.length > 0 ? gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : null;

  return {
    total: days.length,
    last30Days: countWithin(30),
    lastYear: countWithin(365),
    averageGapDays,
    logs: taskLogs,
  };
}
