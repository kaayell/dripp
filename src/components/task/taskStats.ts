import { differenceInCalendarDays, parseISO } from 'date-fns';

export type TaskLogStat = {
  date: string;
  previousDate: string;
  gap: number;
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
      return ago >= 0 && ago < windowDays;
    }).length;

  const taskLogs: TaskLogStat[] = days
    .slice(1)
    .map((date, i) => {
      return {
        date,
        previousDate: days[i],
        gap: differenceInCalendarDays(parseISO(date), parseISO(days[i])),
      };
    })
    .reverse();
  const averageGapDays =
    taskLogs.length > 0 ? taskLogs.reduce((sum, gap) => sum + gap.gap, 0) / taskLogs.length : null;

  return {
    total: days.length,
    last30Days: countWithin(30),
    lastYear: countWithin(365),
    averageGapDays,
    logs: taskLogs,
  };
}
