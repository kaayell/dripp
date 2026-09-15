import { useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Colors, dimmed } from '@/constants/theme';
import { TaskLog } from '../../../db/queries';
import { CalendarHeatmap } from 'react-native-chart-kit/v2';

type TaskCalendarHeatmapProps = {
  color: string;
  taskLogs: TaskLog[];
};

const NUM_DAYS = 370;
const CELL_SIZE = 10;
const GUTTER_SIZE = 3;
const STEP = CELL_SIZE + GUTTER_SIZE;

const GRAPH_LABEL_WIDTH = 28;
const LABEL_HEIGHT = 18;
const GRAPH_HEIGHT = LABEL_HEIGHT + 7 * STEP - GUTTER_SIZE;
const LABELED_WEEKDAYS = [
  { index: 1, label: 'Mon' },
  { index: 3, label: 'Wed' },
  { index: 5, label: 'Fri' },
];

export function TaskCalendarHeatmap({ color, taskLogs }: TaskCalendarHeatmapProps) {
  const today = new Date().toLocaleDateString('sv');
  const { width: windowWidth } = useWindowDimensions();
  const viewportWidth = Math.round(windowWidth) - 34;
  const scrollRef = useRef<ScrollView>(null);

  const markedDates = useMemo(() => {
    return taskLogs.map((log) => {
      return { date: log.date, count: 1 };
    });
  }, [taskLogs]);

  const graphWidth = GRAPH_LABEL_WIDTH + 54 * STEP - GUTTER_SIZE + 8;

  return (
    <View style={styles.row}>
      <View style={styles.labelColumn}>
        {LABELED_WEEKDAYS.map(({ index, label }) => (
          <View
            key={index}
            style={[styles.labelSlot, { top: LABEL_HEIGHT + index * STEP, height: CELL_SIZE }]}
          >
            <Text style={styles.labelText}>{label}</Text>
          </View>
        ))}
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ width: viewportWidth }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <CalendarHeatmap
          values={markedDates}
          endDate={today}
          numDays={NUM_DAYS}
          width={graphWidth}
          height={GRAPH_HEIGHT}
          cellSize={CELL_SIZE}
          gutterSize={GUTTER_SIZE}
          showWeekdayLabels={false}
          showOutOfRangeDays
          emptyColor={dimmed(color, 10)}
          colors={[color]}
          activeCell={{ date: today, scale: 1.3, strokeColor: Colors.teal, strokeWidth: 2 }}
          theme={{
            background: Colors.cellBg,
            plotBackground: Colors.cellBg,
            grid: Colors.border,
            axis: Colors.border,
            text: Colors.label,
            mutedText: Colors.disabled,
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 12,
  },
  labelColumn: {
    width: 30,
    height: GRAPH_HEIGHT,
  },
  labelSlot: {
    position: 'absolute',
    left: 0,
    right: 4,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 5,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.disabled,
  },
});
