import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { CELL_BG, TEAL, TEAL_TINT, TEXT, TEXT_DIMMER } from '../theme';

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
      {items.length > 0 && (
        <View style={styles.fillWrap}>
          {items.map((item) => (
            <View key={item.id} style={{ flex: 1, backgroundColor: item.color }} />
          ))}
        </View>
      )}
      <Text
        style={[
          styles.dayNum,
          isToday && { fontWeight: '700' },
          isDisabled && { color: TEXT_DIMMER },
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  dayNum: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    backgroundColor: CELL_BG,
    fontSize: 15,
    fontWeight: '400',
    color: TEXT,
    lineHeight: 15,
    textAlign: 'right',
    textAlignVertical: 'center',
    borderRadius: 2,
    paddingRight: 6,
  },
  dayCell: {
    borderWidth: 0,
    backgroundColor: CELL_BG,
  },
  dayCellToday: {
    borderWidth: 2,
    borderRadius: 4,
    borderColor: TEAL,
    backgroundColor: TEAL_TINT,
  },
});
