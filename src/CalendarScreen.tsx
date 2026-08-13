import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarList } from 'react-native-calendars';
import type { DateData } from 'react-native-calendars';
import CalendarDay, { DAY_CELL_HEIGHT } from './CalendarDay';
import { BACKGROUND, BORDER, MONTH_TEXT_COLOR, TEXT, TEXT_DIM } from './theme';

const STORAGE_KEY = 'dripp-bled-dates';
const PAST_SCROLL_RANGE = 60;

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const CALENDAR_HEADER_HEIGHT = 36;
const CALENDAR_HEIGHT = CALENDAR_HEADER_HEIGHT + 6 * (DAY_CELL_HEIGHT);

const calendarTheme = {
  calendarBackground: BACKGROUND,
  monthTextColor: MONTH_TEXT_COLOR,
  textMonthFontSize: 13,
  textMonthFontWeight: '600',
  weekVerticalMargin: 0,
  'stylesheet.calendar.header': {
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 10,
      marginBottom: 6,
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
  const [bledDates, setBledDates] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [calendarAreaHeight, setCalendarAreaHeight] = useState(0);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setBledDates(new Set(JSON.parse(raw)));
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback((next: Set<string>) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next))).catch(() => {});
  }, []);

  const toggleBled = useCallback((dateStr: string) => {
    setBledDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      persist(next);
      return next;
    });
  }, [persist]);

  const today = todayStr();

  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean }> = {};
    bledDates.forEach((d) => {
      marks[d] = { marked: true };
    });
    return marks;
  }, [bledDates]);

  const handleDayPress = useCallback(
    (day: DateData) => {
      if (day.dateString > today) return;
      toggleBled(day.dateString);
    },
    [today, toggleBled]
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
            markedDates={markedDates}
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
