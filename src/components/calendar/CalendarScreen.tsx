import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { CalendarList } from 'react-native-calendars';
import {
  Category,
  loadCategories,
  loadTasks,
  loadTrackedTasks,
  Task,
  TrackedTasks,
} from '../../../db/queries';
import CalendarDay from './CalendarDay';
import CalendarLegend from './CalendarLegend';
import CategoryFilter from '../category/CategoryFilter';
import { Colors } from '@/constants/theme';
import Loading from '@/components/Loading';
import { router, useFocusEffect } from 'expo-router';

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const calendarTheme = {
  calendarBackground: Colors.background,
  weekVerticalMargin: 2,
  'stylesheet.calendar.header': {
    header: {
      paddingTop: 20,
      paddingBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      marginBottom: 15,
    },
    monthText: {
      fontSize: 16,
      fontWeight: '600',
      color: Colors.textDim,
    },
  },
  'stylesheet.calendar.main': {
    dayContainer: {
      flex: 1,
    },
  },
  'stylesheet.calendar-list.main': {
    calendar: {
      paddingVertical: 0,
    },
  },
} as any;

export default function CalendarScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trackedTasks, setTrackedTasks] = useState<TrackedTasks[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const today = new Date().toLocaleDateString('sv');

  const refresh = useCallback(async () => {
    const [loadedCategories, loadedTasks, loadedTrackedTasks] = await Promise.all([
      loadCategories(),
      loadTasks(),
      loadTrackedTasks(),
    ]);
    setCategories(loadedCategories);
    setTasks(loadedTasks);
    setTrackedTasks(loadedTrackedTasks);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh()
        .catch((e) => console.error('[CalendarScreen] load failed', e))
        .finally(() => setLoaded(true));
    }, [refresh]),
  );

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

    trackedTasks.forEach(({ date, task }) => {
      if (!visibleTaskIds.has(task.id)) return;

      if (!marks[date]) marks[date] = { items: [] };
      marks[date].items.push({ id: task.id, color: task.color });
    });
    return marks;
  }, [visibleTasks, trackedTasks]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today) return;
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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={selectCategory}
      />

      <View style={{ flexDirection: 'row', paddingVertical: 15 }}>
        {WEEKDAY_LABELS.map((wd) => (
          <Text key={wd} style={styles.weekdayLabel}>
            {wd}
          </Text>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        <CalendarList
          current={today}
          firstDay={0}
          pastScrollRange={6}
          futureScrollRange={0}
          maxDate={today}
          hideDayNames
          showScrollIndicator={false}
          theme={calendarTheme}
          markedDates={markedDates as any}
          dayComponent={CalendarDay}
          onDayPress={handleDayPress}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      </View>

      <CalendarLegend tasks={visibleTasks} />
    </View>
  );
}

const styles = StyleSheet.create({
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.textDim,
    letterSpacing: 0.5,
  },
});
