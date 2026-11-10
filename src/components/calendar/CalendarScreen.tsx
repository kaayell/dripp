import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, FlatList, StyleSheet, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Calendar } from 'react-native-calendars';
import {
  loadTaskLogs,
  loadTasksWithCategory,
  setTaskHidden,
  TaskLogWithTask,
  TaskWithCategory,
} from '../../../db/queries';
import CalendarDay from './CalendarDay';
import CalendarLegend from './CalendarLegend';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import Loading from '@/components/ui/Loading';
import { router, useFocusEffect } from 'expo-router';
import { startDatesForPastMonths, todayString, WEEKDAY_NAMES } from '@/constants/dates';
import * as Haptics from 'expo-haptics';
import { Caption, Heading } from '@/components/ui/Typography';

const calendarTheme = {
  calendarBackground: Colors.background,
  weekVerticalMargin: 0,
  'stylesheet.calendar.header': {
    header: {
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      marginVertical: 5,
    },
  },
  'stylesheet.calendar.main': {
    dayContainer: {
      flex: 1,
    },
  },
} as any;

export default function CalendarScreen() {
  const [tasks, setTasks] = useState<TaskWithCategory[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLogWithTask[]>([]);
  const [loaded, setLoaded] = useState(false);
  const today = todayString();
  const months = startDatesForPastMonths(12);

  const refresh = useCallback(async () => {
    const [loadedTasks, loadedTaskLogs] = await Promise.all([
      loadTasksWithCategory(),
      loadTaskLogs(),
    ]);
    setTasks(loadedTasks);
    setTaskLogs(loadedTaskLogs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh()
        .catch((e) => console.error('[CalendarScreen] load failed', e))
        .finally(() => setLoaded(true));
    }, [refresh]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      refresh().catch((e) => console.error('[CalendarScreen] reload failed', e));
    });
    return () => subscription.remove();
  }, [refresh]);

  const toggleHidden = useCallback(
    (taskId: number) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      const hidden = !task.hidden;
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, hidden } : t)));
      setTaskHidden(taskId, hidden).catch((e) => {
        console.error('[CalendarScreen] visibility toggle failed', e);
        refresh().catch(() => {});
      });
    },
    [tasks, refresh],
  );

  const markedDates = useMemo(() => {
    const hiddenTaskIds = new Set(tasks.filter((t) => t.hidden).map((t) => t.id));
    const marks: Record<string, { items: { id: number; color: string }[] }> = {};

    taskLogs.forEach(({ date, task }) => {
      if (hiddenTaskIds.has(task.id)) return;
      if (!marks[date]) marks[date] = { items: [] };
      marks[date].items.push({ id: task.id, color: task.color });
    });
    return marks;
  }, [tasks, taskLogs]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      router.push({
        pathname: '/task/picker',
        params: { date: day.dateString },
      });
    },
    [today],
  );

  const renderMonthHeader = (date: any) => (
    <View style={styles.header}>
      <Heading style={styles.monthText}>{date?.toString('MMMM')}</Heading>
      <Caption style={styles.yearText}>{date?.toString('yyyy')}</Caption>
    </View>
  );

  if (!loaded) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', paddingVertical: Spacing.base }}>
        {WEEKDAY_NAMES.map((wd) => (
          <Caption key={wd} style={styles.weekdayLabel}>
            {wd}
          </Caption>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          inverted
          data={months}
          keyExtractor={(month) => month}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: month }) => (
            <Calendar
              current={month}
              firstDay={0}
              maxDate={today}
              hideArrows
              hideDayNames
              hideExtraDays
              disableMonthChange
              theme={calendarTheme}
              renderHeader={renderMonthHeader}
              markedDates={markedDates as any}
              dayComponent={CalendarDay}
              onDayPress={handleDayPress}
            />
          )}
        />
      </View>

      <CalendarLegend tasks={tasks} onToggle={refresh} onToggleHidden={toggleHidden} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.base,
    paddingVertical: 5,
  },
  monthText: {
    fontWeight: FontWeight.semibold,
  },
  yearText: {
    fontSize: FontSize.base,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
