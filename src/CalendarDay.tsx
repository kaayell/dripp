import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { CELL_BG, CELL_BORDER, CORAL, TEAL, TEAL_TINT, TEXT, TEXT_DIMMER } from './theme';

export const DAY_CELL_HEIGHT = 56;

export default function CalendarDay({
  date,
  state,
  marking,
  onPress,
}: {
  date?: DateData;
  state?: string;
  marking?: { marked?: boolean };
  onPress?: (date: DateData) => void;
}) {
  if (!date) return null;
  const isToday = state === 'today';
  const isDisabled = state === 'disabled';
  const isBled = !!marking?.marked;
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
        <View style={[styles.markedDayBar, isBled && { backgroundColor: CORAL }]} />
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
  markedDayBar: {
    marginTop: 5,
    width: 18,
    height: 3,
    borderRadius: 1.5,
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
