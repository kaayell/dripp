import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DateData } from 'react-native-calendars';
import { CalendarList } from 'react-native-calendars';
import type { Category, Task, TrackedDates } from '../db/queries';
import { loadCategories, loadTasks, loadTrackedDates, setTrackedDate } from '../db/queries';
import CalendarDay from './CalendarDay';
import CalendarLegend from './CalendarLegend';
import CategoryFilter from './CategoryFilter';
import TaskPickerModal from './TaskPickerModal';
import { BACKGROUND, MONTH_TEXT_COLOR, TEXT_DIM, TEXT_DIMMER } from './theme';

const calendarTheme = {
  calendarBackground: BACKGROUND,
  weekVerticalMargin: 2,
  'stylesheet.calendar.header': {
    header: {
      paddingTop: 20,
      paddingBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: TEXT_DIMMER,
      marginBottom: 15,
    },
    monthText: {
      fontSize: 16,
      fontWeight: '600',
      color: MONTH_TEXT_COLOR,
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
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trackedDates, setTrackedDates] = useState<TrackedDates>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const today = new Date().toLocaleDateString('sv');

  useEffect(() => {
    (async () => {
      try {
        const [loadedCategories, loadedTasks, loadedTrackedDates] = await Promise.all([
          loadCategories(),
          loadTasks(),
          loadTrackedDates(),
        ]);
        setCategories(loadedCategories);
        setTasks(loadedTasks);
        setTrackedDates(loadedTrackedDates);
        setSelectedCategoryId(loadedCategories[0]?.id ?? null);
      } catch (e) {
        console.error('[CalendarScreen] load failed', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const toggleTaskDate = useCallback((taskId: number, dateStr: string) => {
    setTrackedDates((prev) => {
      const current = prev[taskId] ?? new Set<string>();
      const wasMarked = current.has(dateStr);
      const next = new Set(current);
      if (wasMarked) next.delete(dateStr);
      else next.add(dateStr);
      setTrackedDate(taskId, dateStr, !wasMarked).catch(() => {});
      return { ...prev, [taskId]: next };
    });
  }, []);

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
    setFilterVisible(false);
  }, []);

  const selectedCategoryLabel =
    selectedCategoryId == null
      ? 'all'
      : categories.find((category) => category.id === selectedCategoryId)?.name;

  const markedDates = useMemo(() => {
    const marks: Record<string, { items: { id: number; color: string }[] }> = {};
    for (const task of visibleTasks) {
      const dates = trackedDates[task.id];
      if (!dates) continue;
      dates.forEach((d) => {
        if (!marks[d]) marks[d] = { items: [] };
        marks[d].items.push({ id: task.id, color: task.color });
      });
    }
    return marks;
  }, [visibleTasks, trackedDates]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today) return;
      if (visibleTasks.length > 1) {
        setPickerDate(day.dateString);
        return;
      }
      const taskId = visibleTasks[0]?.id;
      if (taskId == null) return;
      toggleTaskDate(taskId, day.dateString);
    },
    [today, visibleTasks, toggleTaskDate],
  );

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: BACKGROUND }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: BACKGROUND }}>
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        selectedCategoryLabel={selectedCategoryLabel}
        filterVisible={filterVisible}
        onToggleFilter={() => setFilterVisible((prev) => !prev)}
        onCloseFilter={() => setFilterVisible(false)}
        onSelectCategory={selectCategory}
      />

      <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((wd) => (
          <Text key={wd} style={styles.weekdayLabel}>
            {wd}
          </Text>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        <CalendarList
          current={today}
          firstDay={0}
          pastScrollRange={12}
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

      <TaskPickerModal
        pickerDate={pickerDate}
        tasks={visibleTasks}
        trackedDates={trackedDates}
        bottomInset={insets.bottom}
        onToggleTask={toggleTaskDate}
        onClose={() => setPickerDate(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '600',
    color: TEXT_DIM,
    letterSpacing: 0.5,
  },
});
