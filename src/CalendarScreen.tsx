import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarList } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import { loadCategories, loadTasks, loadTrackedDates, setTrackedDate } from '../db/queries';
import type { Category, Task, TrackedDates } from '../db/queries';
import CalendarDay, { DAY_CELL_HEIGHT } from './CalendarDay';
import { BACKGROUND, BORDER, CELL_BG, CELL_BORDER, MONTH_TEXT_COLOR, TEXT, TEXT_DIM } from './theme';

const PAST_SCROLL_RANGE = 60;

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const CALENDAR_HEADER_HEIGHT = 36;
const CALENDAR_HEIGHT = CALENDAR_HEADER_HEIGHT + 6 * DAY_CELL_HEIGHT;

const calendarTheme = {
  calendarBackground: BACKGROUND,
  monthTextColor: MONTH_TEXT_COLOR,
  textMonthFontSize: 13,
  textMonthFontWeight: '600',
  weekVerticalMargin: 0,
  'stylesheet.calendar.header': {
    header: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 30,
    },
    monthText: {
      margin: 0,
      fontSize: 13,
      fontWeight: '600',
      color: MONTH_TEXT_COLOR,
    },
  },
  'stylesheet.calendar.main': {
    container: {
      paddingLeft: 0,
      paddingRight: 0,
      backgroundColor: BACKGROUND,
    },
    dayContainer: {
      flex: 1,
      alignItems: 'stretch',
    },
  },
  'stylesheet.calendar-list.main': {
    calendar: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
} as any;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [trackedDates, setTrackedDates] = useState<TrackedDates>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [calendarAreaHeight, setCalendarAreaHeight] = useState(0);
  const calendarRef = useRef<any>(null);

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
          loadedTasks.find((task) => task.categoryId === firstCategory?.id)?.id ?? null
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
    (categoryId: number | null) => tasks.filter((task) => task.categoryId === categoryId),
    [tasks]
  );

  const selectCategory = useCallback(
    (categoryId: number) => {
      setSelectedCategoryId(categoryId);
      setSelectedTaskId(tasks.find((task) => task.categoryId === categoryId)?.id ?? null);
    },
    [tasks]
  );

  const today = todayStr();

  const markedDates = useMemo(() => {
    const marks: Record<string, { items: { id: number; color: string }[] }> = {};
    for (const task of tasks) {
      const dates = trackedDates[task.id];
      if (!dates) continue;
      dates.forEach((d) => {
        if (!marks[d]) marks[d] = { items: [] };
        marks[d].items.push({ id: task.id, color: task.color });
      });
    }
    return marks;
  }, [tasks, trackedDates]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today || selectedTaskId == null) return;
      toggleTaskDate(selectedTaskId, day.dateString);
    },
    [today, selectedTaskId, toggleTaskDate]
  );

  const scrollToToday = useCallback(() => {
    calendarRef.current?.scrollToDay(today, 0, true);
  }, [today]);

  if (!loaded) {
    return <View style={[styles.root, { paddingTop: insets.top }]} />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Image source={require('../assets/icon.png')} style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Dripp</Text>
        </View>
        <Pressable
          style={styles.todayButton}
          onPress={scrollToToday}
          hitSlop={8}
          accessibilityLabel="Scroll to today"
        >
          <Image source={require('../assets/calendar-arrow-down.png')} style={styles.headerIcon} />
        </Pressable>
      </View>

      <View style={styles.categoryRow}>
        {categories.map((category) => {
          const active = category.id === selectedCategoryId;
          return (
            <Pressable
              key={category.id}
              onPress={() => selectCategory(category.id)}
              style={[styles.categoryTab, active && styles.categoryTabActive]}
            >
              <Text style={[styles.categoryTabText, active && styles.categoryTabTextActive]}>
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.itemRow}
        contentContainerStyle={styles.itemRowContent}
      >
        {tasksForCategory(selectedCategoryId).map((task) => {
          const active = task.id === selectedTaskId;
          return (
            <Pressable
              key={task.id}
              onPress={() => setSelectedTaskId(task.id)}
              style={[
                styles.itemChip,
                { borderColor: task.color },
                active && { backgroundColor: task.color },
              ]}
            >
              <Text style={[styles.itemChipText, active && styles.itemChipTextActive]}>
                {task.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((wd) => (
          <Text key={wd} style={styles.weekdayLabel}>{wd}</Text>
        ))}
      </View>

      <View
        style={styles.calendarArea}
        onLayout={(e) => setCalendarAreaHeight(e.nativeEvent.layout.height)}
      >
        {calendarAreaHeight > 0 && (
          <CalendarList
            ref={calendarRef}
            current={today}
            firstDay={0}
            pastScrollRange={PAST_SCROLL_RANGE}
            futureScrollRange={0}
            maxDate={today}
            hideDayNames
            showScrollIndicator={false}
            calendarHeight={CALENDAR_HEIGHT}
            theme={calendarTheme}
            markedDates={markedDates as any}
            dayComponent={CalendarDay}
            onDayPress={handleDayPress}
            style={{ height: calendarAreaHeight }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '600',
    color: TEXT,
    letterSpacing: -0.2,
  },
  todayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: CELL_BG,
    borderWidth: 1,
    borderColor: CELL_BORDER,
  },
  categoryTabActive: {
    backgroundColor: TEXT,
    borderColor: TEXT,
  },
  categoryTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: TEXT_DIM,
  },
  categoryTabTextActive: {
    color: BACKGROUND,
  },
  itemRow: {
    marginTop: 8,
    flexGrow: 0,
  },
  itemRowContent: {
    paddingHorizontal: 10,
    gap: 8,
  },
  itemChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: TEXT_DIM,
  },
  itemChipTextActive: {
    color: BACKGROUND,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '600',
    color: TEXT_DIM,
    letterSpacing: 0.5,
  },
  calendarArea: {
    flex: 1,
  },
});
