import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CalendarList, type DateData } from 'react-native-calendars';
import { isSameMonth, parseISO } from 'date-fns';
import { Colors, dimmed } from '@/constants/theme';
import { todayString } from '@/constants/dates';
import { TaskLog, TaskNote, toggleTaskLog } from '../../../db/queries';
import TaskCalendarDay from './TaskCalendarDay';
import { IconButton } from '@/components/ui/IconButton';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

type CalendarListRef = { scrollToMonth: (date: string) => void };

const calendarTheme = {
  calendarBackground: Colors.cellBg,
  dayTextColor: Colors.text,
  textDisabledColor: Colors.disabled,
  monthTextColor: Colors.text,
  weekVerticalMargin: 2,
  'stylesheet.calendar.header': {
    dayHeader: {
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
  taskNotes: TaskNote[];
  onToggle?: () => void;
};

export function TaskCalendar({ taskId, color, taskLogs, taskNotes, onToggle }: TaskCalendarProps) {
  const today = todayString();
  const [visibleMonth, setVisibleMonth] = useState(today);
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.round(windowWidth) - 34;
  const calendarRef = useRef<CalendarListRef>(null);

  const markedDates = useMemo(() => {
    const marks: Record<string, { color?: string; hasNote?: boolean }> = Object.fromEntries(
      taskLogs.map(({ date }) => {
        const isVisibleMonth = isSameMonth(parseISO(date), parseISO(visibleMonth));
        return [date, { color: dimmed(color, isVisibleMonth ? 60 : 15) }];
      }),
    );
    taskNotes.forEach(({ date }) => {
      marks[date] = { ...marks[date], hasNote: true };
    });
    return marks;
  }, [taskLogs, taskNotes, color, visibleMonth]);

  const handleMonthChange = (month: DateData) => {
    setVisibleMonth(month.dateString);
  };

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today) return;
      const isDifferentMonth = !isSameMonth(parseISO(day.dateString), parseISO(visibleMonth));
      if (isDifferentMonth) {
        calendarRef.current?.scrollToMonth(day.dateString);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      toggleTaskLog(taskId, day.dateString)
        .then(() => onToggle?.())
        .catch(() => {});
    },
    [taskId, today, visibleMonth, onToggle],
  );

  const handleDayLongPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today) return;
      const isDifferentMonth = !isSameMonth(parseISO(day.dateString), parseISO(visibleMonth));
      if (isDifferentMonth) {
        calendarRef.current?.scrollToMonth(day.dateString);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({ pathname: '/task/note', params: { taskId, date: day.dateString, color } });
    },
    [taskId, color, today, visibleMonth],
  );

  const renderHeader = useCallback(
    (date: any) => {
      if (!date) return null;
      const isMaxMonth = date.toString('yyyy-MM') === today.slice(0, 7);

      const goToMonth = (offset: number) => {
        const target = date.clone().addMonths(offset);
        calendarRef.current?.scrollToMonth(target.toString('yyyy-MM-01'));
      };

      return (
        <View style={styles.header}>
          <Text style={styles.monthText}>{date.toString('MMMM yyyy')}</Text>
          <View style={styles.arrows}>
            <IconButton
              onPress={() => goToMonth(-1)}
              icon={<ChevronLeft color={Colors.icon} size={20} strokeWidth={2.25} />}
            />
            <IconButton
              onPress={() => goToMonth(1)}
              disabled={isMaxMonth}
              icon={
                <ChevronRight
                  color={isMaxMonth ? Colors.disabled : Colors.icon}
                  size={20}
                  strokeWidth={2.25}
                />
              }
            />
          </View>
        </View>
      );
    },
    [today],
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
      showSixWeeks
      staticHeader
      hideArrows
      renderHeader={renderHeader}
      futureScrollRange={0}
      hideExtraDays={false}
      maxDate={today}
      markedDates={markedDates}
      dayComponent={TaskCalendarDay}
      onMonthChange={handleMonthChange}
      onDayPress={handleDayPress}
      onDayLongPress={handleDayLongPress}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  arrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
