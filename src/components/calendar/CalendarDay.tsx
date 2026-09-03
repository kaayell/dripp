import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Colors } from '@/constants/theme';
import Drop from '@/components/ui/Drop';

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
      <Text
        style={[
          styles.dayNum,
          isToday && { fontWeight: '700' },
          isDisabled && { color: Colors.textDimmer },
        ]}
      >
        {date.day}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dayWrap: {
    height: 56,
    marginHorizontal: 2,
    borderRadius: 4,
    overflow: 'hidden',
    padding: 6,
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
    right: 3,
    width: DAY_NUM_SIZE,
    height: DAY_NUM_SIZE,
    fontSize: 13,
    fontWeight: '400',
    color: Colors.text,
    lineHeight: DAY_NUM_SIZE,
    textAlign: 'right',
    textAlignVertical: 'center',
    borderRadius: 2,
  },
  dayCell: {
    borderWidth: 0,
    backgroundColor: Colors.cellBg,
  },
  dayCellToday: {
    borderWidth: 2,
    borderRadius: 2,
    borderColor: Colors.teal,
    backgroundColor: Colors.tealTint,
  },
});
