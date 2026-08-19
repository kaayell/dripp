import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DateData } from 'react-native-calendars';
import { CalendarList } from 'react-native-calendars';
import type { Category, Task, TrackedDates } from '../db/queries';
import { loadCategories, loadTasks, loadTrackedDates, setTrackedDate } from '../db/queries';
import CalendarDay from './CalendarDay';
import CalendarHeader from './CalendarHeader';
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
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
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
        const firstCategory = loadedCategories[0];
        setSelectedCategoryId(firstCategory?.id ?? null);
        setSelectedTaskId(
          loadedTasks.find((task) => task.categoryId === firstCategory?.id)?.id ?? null,
        );
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

  const selectCategory = useCallback(
    (categoryId: number | null) => {
      setSelectedCategoryId(categoryId);
      setSelectedTaskId(tasksForCategory(categoryId)[0]?.id ?? null);
      setFilterVisible(false);
    },
    [tasksForCategory],
  );

  const selectedCategoryLabel =
    selectedCategoryId == null
      ? 'all'
      : categories.find((category) => category.id === selectedCategoryId)?.name;

  const markedDates = useMemo(() => {
    const marks: Record<string, { items: { id: number; color: string }[] }> = {};
    for (const task of tasksForCategory(selectedCategoryId)) {
      const dates = trackedDates[task.id];
      if (!dates) continue;
      dates.forEach((d) => {
        if (!marks[d]) marks[d] = { items: [] };
        marks[d].items.push({ id: task.id, color: task.color });
      });
    }
    return marks;
  }, [tasksForCategory, selectedCategoryId, trackedDates]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today) return;
      const categoryTasks = tasksForCategory(selectedCategoryId);
      if (categoryTasks.length > 1) {
        setPickerDate(day.dateString);
        return;
      }
      const taskId = categoryTasks[0]?.id ?? selectedTaskId;
      if (taskId == null) return;
      toggleTaskDate(taskId, day.dateString);
    },
    [today, selectedCategoryId, selectedTaskId, tasksForCategory, toggleTaskDate],
  );

  if (!loaded) {
    return <View style={{ paddingTop: insets.top }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: BACKGROUND, paddingTop: insets.top }}>
      <CalendarHeader
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
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        />
      </View>

      <TaskPickerModal
        pickerDate={pickerDate}
        tasks={tasksForCategory(selectedCategoryId)}
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
