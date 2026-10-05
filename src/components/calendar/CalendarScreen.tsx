import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, FlatList, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Calendar } from 'react-native-calendars';
import {
  Category,
  loadCategories,
  loadTaskLogs,
  loadTasks,
  Task,
  TaskLogWithTask,
} from '../../../db/queries';
import CalendarDay from './CalendarDay';
import CalendarLegend from './CalendarLegend';
import CategoryFilter from '../category/CategoryFilter';
import { Colors } from '@/constants/theme';
import Loading from '@/components/ui/Loading';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen.tsx';
import { startDatesForPastMonths, todayString, WEEKDAY_NAMES } from '@/constants/dates';
import * as Haptics from 'expo-haptics';

const calendarTheme = {
  calendarBackground: Colors.background,
  weekVerticalMargin: 2,
  'stylesheet.calendar.header': {
    header: {
      paddingLeft: 10,
      paddingVertical: 5,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      marginVertical: 5,
    },
    monthText: {
      fontSize: 20,
      fontWeight: '600',
      color: Colors.text,
    },
  },
  'stylesheet.calendar.main': {
    dayContainer: {
      flex: 1,
    },
  },
} as any;

export default function CalendarScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLogWithTask[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const today = todayString();
  const months = startDatesForPastMonths(12);

  const refresh = useCallback(async () => {
    const [loadedCategories, loadedTasks, loadedTaskLogs] = await Promise.all([
      loadCategories(),
      loadTasks(),
      loadTaskLogs(),
    ]);
    setCategories(loadedCategories);
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

  const tasksForCategory = useCallback(
    (categoryId: number | null) =>
      categoryId == null ? tasks : tasks.filter((task) => task.categoryId === categoryId),
    [tasks],
  );

  const visibleTasks = useMemo(
    () => tasksForCategory(selectedCategoryId),
    [tasksForCategory, selectedCategoryId],
  );

  const selectCategory = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const markedDates = useMemo(() => {
    const visibleTaskIds = new Set(visibleTasks.map((task) => task.id));
    const marks: Record<string, { items: { id: number; color: string }[] }> = {};

    taskLogs.forEach(({ date, task }) => {
      if (!visibleTaskIds.has(task.id)) return;

      if (!marks[date]) marks[date] = { items: [] };
      marks[date].items.push({ id: task.id, color: task.color });
    });
    return marks;
  }, [visibleTasks, taskLogs]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      router.push({
        pathname: '/task-picker',
        params: {
          date: day.dateString,
          categoryId: selectedCategoryId,
        },
      });
    },
    [today, visibleTasks],
  );

  if (!loaded) {
    return <Loading />;
  }

  return (
    <SafeAreaScreen padded={false}>
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={selectCategory}
      />

      <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
        {WEEKDAY_NAMES.map((wd) => (
          <Text key={wd} style={styles.weekdayLabel}>
            {wd}
          </Text>
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
              markedDates={markedDates as any}
              dayComponent={CalendarDay}
              onDayPress={handleDayPress}
            />
          )}
        />
      </View>

      <CalendarLegend tasks={visibleTasks} onToggle={refresh} />
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.label,
    letterSpacing: 0.5,
  },
});
