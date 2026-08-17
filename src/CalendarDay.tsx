import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { CELL_BG, CELL_BORDER, TEAL, TEAL_TINT, TEXT, TEXT_DIMMER } from './theme';

export const DAY_CELL_HEIGHT = 56;

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
  const items: { id: number; color: string }[] = marking?.items ?? [];
  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => onPress?.(date)}
      style={[
        styles.dayWrap,
        {
          borderWidth: isToday ? 2 : 1,
          borderColor: isToday ? TEAL : CELL_BORDER,
          backgroundColor: isToday ? TEAL_TINT : CELL_BG,
        },
      ]}
    >
      <View style={styles.dayContent}>
        <Text
          style={[
            styles.dayNum,
            isToday && styles.dayNumToday,
            isDisabled && { color: TEXT_DIMMER },
          ]}
        >
          {date.day}
        </Text>
        <View style={styles.markRow}>
          {items.map((item) => (
            <View key={item.id} style={[styles.markSquare, { backgroundColor: item.color }]} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dayWrap: {
    height: DAY_CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    height: 6,
    marginTop: 5,
    gap: 2,
    maxWidth: 34,
  },
  markSquare: {
    width: 4,
    height: 4,
    borderRadius: 1,
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
