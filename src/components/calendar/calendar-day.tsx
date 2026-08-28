import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Colors } from '@/constants/theme';

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
              <View key={`spacer-${i}`} style={styles.tile} />
            ) : (
              <View key={mark.id} style={[styles.tile, { backgroundColor: mark.color }]} />
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
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderTopLeftRadius: TILE_SIZE / 2,
    borderTopRightRadius: TILE_SIZE / 2,
    borderBottomRightRadius: TILE_SIZE / 2,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '135deg' }],
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
