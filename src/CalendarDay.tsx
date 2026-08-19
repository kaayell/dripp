import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { CELL_BG, TEAL, TEAL_TINT, TEXT, TEXT_DIMMER } from './theme';

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
      style={[styles.dayWrap, isToday ? styles.dayCellToday : styles.dayCell]}
    >
      <Text
        style={[
          styles.dayNum,
          isToday && { fontWeight: '700' },
          isDisabled && { color: TEXT_DIMMER },
        ]}
      >
        {date.day}
      </Text>
      <View style={styles.markBarWrap}>
        {items.length > 0 && (
          <View style={styles.markBar}>
            {items.map((item) => (
              <View key={item.id} style={{ flex: 1, backgroundColor: item.color }} />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dayWrap: {
    height: 56,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 15,
    fontWeight: '400',
    color: TEXT,
    lineHeight: 15,
  },
  dayCell: {
    borderWidth: 0,
    backgroundColor: CELL_BG,
  },
  dayCellToday: {
    borderWidth: 2,
    borderRadius: 2,
    borderColor: TEAL,
    backgroundColor: TEAL_TINT,
  },
  markBarWrap: {
    height: 6,
    paddingTop: 10,
    width: 34,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  markBar: {
    flexDirection: 'row',
    height: 5,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
});
