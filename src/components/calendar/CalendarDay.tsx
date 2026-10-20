import { Pressable, StyleSheet, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Colors, FontWeight, Radius, Spacing } from '@/constants/theme';
import Drop from '@/components/ui/Drop';
import { DayNumber } from '@/components/ui/Typography';

const COLS = 3;
const TILE_SIZE = 10;
const DAY_NUM_SIZE = 16;

type Markings = { id?: number; color?: string; spacer?: boolean };

function buildTiles(items: Markings[]): Markings[] {
  const reservedForDayNum = COLS - 1;
  return [
    ...items.slice(0, reservedForDayNum),
    { spacer: true },
    ...items.slice(reservedForDayNum),
  ];
}

export default function CalendarDay({
  date,
  state,
  marking,
  onPress,
}: {
  date?: DateData;
  state?: string;
  marking?: any;
  onPress?: (date: DateData) => void;
}) {
  if (!date) return null;
  const isToday = state === 'today';
  const isDisabled = state === 'disabled';
  const markings: Markings[] = marking?.items ?? [];
  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => onPress?.(date)}
      style={[styles.dayWrap, isToday ? styles.dayCellToday : styles.dayCell]}
    >
      {markings.length > 0 && (
        <View style={styles.tilesWrap}>
          {buildTiles(markings).map((mark, i) =>
            mark.spacer ? (
              <Drop key={`spacer-${i}`} size={TILE_SIZE} />
            ) : (
              <Drop key={mark.id} color={mark.color} size={TILE_SIZE} />
            ),
          )}
        </View>
      )}
      <DayNumber
        style={[
          styles.dayNum,
          isToday && { fontWeight: FontWeight.bold },
          isDisabled && { color: Colors.disabled },
        ]}
      >
        {date.day}
      </DayNumber>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dayWrap: {
    height: 56,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    padding: Spacing.sm,
  },
  tilesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    columnGap: 3,
    rowGap: 5,
  },
  dayNum: {
    position: 'absolute',
    top: 3,
    right: 4,
    width: DAY_NUM_SIZE,
    height: DAY_NUM_SIZE,
    lineHeight: DAY_NUM_SIZE,
    textAlign: 'right',
    textAlignVertical: 'center',
    borderRadius: Radius.sm,
  },
  dayCell: {
    borderWidth: 2,
    borderColor: Colors.background,
    backgroundColor: Colors.cellBg,
  },
  dayCellToday: {
    borderWidth: 2,
    borderRadius: Radius.sm,
    borderColor: Colors.teal,
    backgroundColor: Colors.tealTint,
  },
});
