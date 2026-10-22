import { useCallback, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { CalendarList, type DateData } from 'react-native-calendars';
import { isSameMonth, parseISO } from 'date-fns';
import { Colors, FontFamily, FontSize, Spacing } from '@/constants/theme';
import { todayString } from '@/constants/dates';
import { TaskLog, TaskNote, toggleTaskLog } from '../../../db/queries';
import TaskCalendarDay from './TaskCalendarDay';
import { IconButton } from '@/components/ui/IconButton';
import { MoveLeft, MoveRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { SectionTitle } from '@/components/ui/Typography';

type CalendarListRef = { scrollToMonth: (date: string) => void };

const calendarTheme = {
  calendarBackground: Colors.background,
  weekVerticalMargin: 0,
  'stylesheet.calendar.main': {
    container: { paddingLeft: 0, paddingRight: 0 },
  },
  'stylesheet.calendar.header': {
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: 0,
      paddingRight: 0,
    },
    dayHeader: {
      flex: 1,
      textAlign: 'center',
      fontSize: FontSize.sm,
      fontFamily: FontFamily.mono,
      textTransform: 'uppercase',
      color: Colors.label,
      paddingBottom: Spacing.sm,
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
  const [width, setWidth] = useState(0);
  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const calendarRef = useRef<CalendarListRef>(null);

  const markedDates = useMemo(() => {
    const marks: Record<string, { color?: string; hasNote?: boolean }> = Object.fromEntries(
      taskLogs.map(({ date }) => [date, { color }]),
    );
    taskNotes.forEach(({ date }) => {
      marks[date] = { ...marks[date], hasNote: true };
    });
    return marks;
  }, [taskLogs, taskNotes, color]);

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
          <SectionTitle>{date.toString('MMMM yyyy')}</SectionTitle>
          <View style={styles.arrows}>
            <IconButton
              onPress={() => goToMonth(-1)}
              icon={<MoveLeft color={Colors.icon} size={20} strokeWidth={2.25} />}
            />
            <IconButton
              onPress={() => goToMonth(1)}
              disabled={isMaxMonth}
              icon={
                <MoveRight
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
    <View onLayout={handleLayout}>
      {width > 0 && (
        <CalendarList
          ref={calendarRef}
          theme={calendarTheme}
          calendarStyle={styles.calendar}
          headerStyle={styles.calendarHeader}
          horizontal
          pagingEnabled
          animateScroll
          calendarWidth={width}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  calendarHeader: {
    paddingHorizontal: 0,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  arrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
});
