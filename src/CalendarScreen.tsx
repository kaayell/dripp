import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STORAGE_KEY = 'dripp-bled-dates';
const INITIAL_MONTHS = 4;
const MONTHS_PER_LOAD = 3;
const MAX_MONTHS = 60;
const NEAR_TOP_THRESHOLD = 300;

const BACKGROUND = '#18171b';
const TEXT = '#f2efe9';
const TEXT_DIM = 'rgba(242,239,233,0.4)';
const TEXT_DIMMER = 'rgba(242,239,233,0.25)';
const BORDER = 'rgba(255,255,255,0.08)';
const CELL_BORDER = 'rgba(255,255,255,0.07)';
const CELL_BG = 'rgba(255,255,255,0.025)';
const CORAL = '#ec5b57';
const TEAL = '#00b7c1';
const TEAL_TINT = 'rgba(0,183,193,0.08)';

const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function fmtDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function todayStr() {
  const d = new Date();
  return fmtDate(d.getFullYear(), d.getMonth(), d.getDate());
}

type Day = {
  key: string;
  hasContent: boolean;
  num?: number;
  dateStr?: string;
  isToday?: boolean;
  isFuture?: boolean;
  isBled?: boolean;
};

type Month = {
  key: string;
  label: string;
  weeks: Day[][];
};

function buildMonth(year: number, monthIdx: number, bledDates: Set<string>, today: string): Month {
  const first = new Date(year, monthIdx, 1);
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstWeekday = (first.getDay() + 6) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Day[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    const week = cells.slice(i, i + 7).map((d, idx): Day => {
      if (d === null) {
        return { key: `${year}-${monthIdx}-blank-${i}-${idx}`, hasContent: false };
      }
      const dateStr = fmtDate(year, monthIdx, d);
      return {
        key: dateStr,
        hasContent: true,
        num: d,
        dateStr,
        isToday: dateStr === today,
        isFuture: dateStr > today,
        isBled: bledDates.has(dateStr),
      };
    });
    weeks.push(week);
  }

  return {
    key: `${year}-${monthIdx}`,
    label: first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    weeks,
  };
}

function buildMonths(count: number, bledDates: Set<string>, today: string): Month[] {
  const now = new Date();
  const months: Month[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(buildMonth(d.getFullYear(), d.getMonth(), bledDates, today));
  }
  return months;
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [bledDates, setBledDates] = useState<Set<string>>(new Set());
  const [monthsToShow, setMonthsToShow] = useState(INITIAL_MONTHS);
  const [loaded, setLoaded] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const scrolledInitially = useRef(false);
  const prevContentHeight = useRef(0);
  const shouldAdjustScroll = useRef(false);
  const lastScrollY = useRef(0);

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
  const months = buildMonths(monthsToShow, bledDates, today);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    lastScrollY.current = y;
    if (y < NEAR_TOP_THRESHOLD && monthsToShow < MAX_MONTHS) {
      prevContentHeight.current = e.nativeEvent.contentSize.height;
      shouldAdjustScroll.current = true;
      setMonthsToShow((m) => Math.min(m + MONTHS_PER_LOAD, MAX_MONTHS));
    }
  };

  const handleContentSizeChange = (_w: number, height: number) => {
    if (!scrolledInitially.current) {
      if (height <= 0) return;
      scrolledInitially.current = true;
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
      return;
    }
    if (shouldAdjustScroll.current) {
      shouldAdjustScroll.current = false;
      const delta = height - prevContentHeight.current;
      if (delta > 0) {
        scrollRef.current?.scrollTo({ y: lastScrollY.current + delta, animated: false });
      }
    }
  };

  const stickyHeaderIndices: number[] = [];
  const children: React.ReactNode[] = [];
  months.forEach((month) => {
    stickyHeaderIndices.push(children.length);
    children.push(
      <View key={`h-${month.key}`} style={styles.monthHeader}>
        <Text style={styles.monthHeaderText}>{month.label}</Text>
      </View>
    );
    children.push(
      <View key={`g-${month.key}`}>
        {month.weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((day) => (
              <DayCell key={day.key} day={day} onToggle={toggleBled} />
            ))}
          </View>
        ))}
      </View>
    );
  });

  if (!loaded) {
    return <View style={[styles.root, { paddingTop: insets.top }]} />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dripp</Text>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((wd) => (
          <Text key={wd} style={styles.weekdayLabel}>{wd}</Text>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 16 }}
        stickyHeaderIndices={stickyHeaderIndices}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={32}
      >
        {children}
      </ScrollView>
    </View>
  );
}

function DayCell({ day, onToggle }: { day: Day; onToggle: (dateStr: string) => void }) {
  if (!day.hasContent) {
    return <View style={styles.dayWrap} />;
  }
  const { dateStr, num, isToday, isFuture, isBled } = day;
  return (
    <Pressable
      disabled={isFuture}
      onPress={() => dateStr && onToggle(dateStr)}
      style={[
        styles.dayWrap,
        {
          borderWidth: isToday ? 2 : 1,
          borderColor: isToday ? TEAL : CELL_BORDER,
          backgroundColor: isToday ? TEAL_TINT : CELL_BG,
        },
      ]}
    >
      <View
        style={[
          styles.dayCircle,
          isBled && { backgroundColor: CORAL },
        ]}
      >
        <Text
          style={[
            styles.dayNum,
            isToday && styles.dayNumToday,
            isFuture && { color: TEXT_DIMMER },
            isBled && { color: BACKGROUND },
          ]}
        >
          {num}
        </Text>
      </View>
    </Pressable>
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
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '600',
    color: TEXT,
    letterSpacing: -0.2,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 6,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '600',
    color: TEXT_DIM,
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  monthHeader: {
    backgroundColor: BACKGROUND,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  monthHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(242,239,233,0.55)',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayWrap: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '400',
    color: TEXT,
    lineHeight: 15,
  },
  dayNumToday: {
    fontWeight: '700',
  },
});
