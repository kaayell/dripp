import { useCallback, useMemo, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { CalendarList, type DateData } from 'react-native-calendars';
import { Colors, dimmed } from '@/constants/theme';
import { TaskLog, toggleTaskLog } from '../../../db/queries';
import TaskCalendarDay from './TaskCalendarDay';

type CalendarListRef = { scrollToMonth: (date: string) => void };

const calendarTheme = {
  calendarBackground: Colors.cellBg,
  dayTextColor: Colors.text,
  textDisabledColor: Colors.disabled,
  monthTextColor: Colors.text,
  weekVerticalMargin: 2,
  'stylesheet.calendar.header': {
    header: {
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    monthText: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors.text,
    },
    dayHeader: {
      marginTop: 2,
      marginBottom: 7,
      width: 38,
      fontSize: 13,
      textAlign: 'center',
      textTransform: 'uppercase',
      color: Colors.label,
    },
  },
};

type TaskCalendarProps = {
  taskId: number;
  color: string;
  taskLogs: TaskLog[];
  onToggle?: () => void;
};

export function TaskCalendar({ taskId, color, taskLogs, onToggle }: TaskCalendarProps) {
  const now = new Date();
  const today = now.toLocaleDateString('sv');
  const currentYearMonth = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const [visibleMonth, setVisibleMonth] = useState(currentYearMonth);
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.round(windowWidth) - 34;
  const calendarRef = useRef<CalendarListRef>(null);

  const markedDates = useMemo(() => {
    return Object.fromEntries(
      taskLogs.map(({ date }) => {
        const [year, month] = date.split('-').map(Number);
        const isVisibleMonth = year === visibleMonth.year && month === visibleMonth.month;
        return [date, { color: dimmed(color, isVisibleMonth ? 60 : 15) }];
      }),
    );
  }, [taskLogs, color, visibleMonth]);

  const handleMonthChange = useCallback(({ year, month }: { year: number; month: number }) => {
    setVisibleMonth({ year, month });
  }, []);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today) return;
      const isDifferentMonth = day.year !== visibleMonth.year || day.month !== visibleMonth.month;
      if (isDifferentMonth) {
        calendarRef.current?.scrollToMonth(day.dateString);
      }
      toggleTaskLog(taskId, day.dateString)
        .then(() => onToggle?.())
        .catch(() => {});
    },
    [taskId, today, visibleMonth, onToggle],
  );

  return (
    <CalendarList
      ref={calendarRef}
      theme={calendarTheme}
      horizontal
      pagingEnabled
      animateScroll
      calendarWidth={width}
      calendarHeight={400}
      hideArrows
      showSixWeeks
      futureScrollRange={0}
      showScrollIndicator={false}
      hideExtraDays={false}
      maxDate={today}
      markedDates={markedDates}
      dayComponent={TaskCalendarDay}
      onMonthChange={handleMonthChange}
      onDayPress={handleDayPress}
    />
  );
}
