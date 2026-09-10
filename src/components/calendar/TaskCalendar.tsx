import { useCallback, useMemo, useState } from 'react';
import { Calendar, type DateData } from 'react-native-calendars';
import { Colors, dimmed } from '@/constants/theme';
import { TaskLog } from '../../../db/queries';
import TaskCalendarDay from './TaskCalendarDay';

type TaskCalendarProps = {
  color: string;
  taskLogs: TaskLog[];
};

export function TaskCalendar({ color, taskLogs }: TaskCalendarProps) {
  const now = new Date();
  const today = now.toLocaleDateString('sv');
  const currentYearMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const [visibleMonth, setVisibleMonth] = useState(currentYearMonth);

  const markedDates = useMemo(() => {
    return Object.fromEntries(
      taskLogs.map(({ date }) => {
        const [year, month] = date.split('-').map(Number);
        const isVisibleMonth = year === visibleMonth.year && month === visibleMonth.month;
        return [date, { color: dimmed(color, isVisibleMonth ? 60 : 15) }];
      }),
    );
  }, [taskLogs, color, visibleMonth]);

  const calendarTheme = useMemo(
    () => ({
      calendarBackground: Colors.cellBg,
      dayTextColor: Colors.text,
      textDisabledColor: Colors.textDimmer,
      'stylesheet.calendar.header': {
        header: {
          paddingVertical: 12,
          paddingHorizontal: 14,
        },
        monthText: {
          fontSize: 16,
          fontWeight: '700',
          color: Colors.text,
        },
        dayHeader: {
          marginTop: 2,
          marginBottom: 7,
          width: 32,
          fontSize: 12,
          textAlign: 'center' as const,
          textTransform: 'uppercase' as const,
          color: Colors.textDim,
        },
      },
    }),
    [color],
  );

  const handleMonthChange = useCallback(({ year, month }: { year: number; month: number }) => {
    const isFuture =
      year > currentYearMonth.year ||
      (year === currentYearMonth.year && month > currentYearMonth.month);
    if (isFuture) {
      return;
    }
    setVisibleMonth({ year, month });
  }, []);

  const handleDayPress = useCallback((day: DateData) => {
    if (day.dateString > today) return;
  }, []);

  return (
    <Calendar
      theme={calendarTheme}
      enableSwipeMonths
      hideArrows
      showSixWeeks
      maxDate={today}
      markedDates={markedDates}
      dayComponent={TaskCalendarDay}
      onMonthChange={handleMonthChange}
      onDayPress={handleDayPress}
    />
  );
}
