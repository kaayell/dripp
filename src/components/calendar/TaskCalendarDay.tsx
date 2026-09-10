import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Colors } from '@/constants/theme';
import Drop from '@/components/ui/Drop';

type Marking = { color?: string; dim?: boolean };

export default function TaskCalendarDay({
  date,
  state,
  marking,
  onPress,
}: {
  date?: DateData;
  state?: string;
  marking?: Marking;
  onPress?: (date: DateData) => void;
}) {
  if (!date) return null;
  const isToday = state === 'today';
  const isDisabled = state === 'disabled';
  const marked = !!marking?.color;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => onPress?.(date)}
      style={[styles.cell, isToday && styles.cellToday]}
    >
      {marked && (
        <View style={styles.dropWrap}>
          <Drop color={marking!.color} size={30} />
        </View>
      )}
      <Text
        style={[
          styles.dayNum,
          marked && { fontWeight: '700' },
          isDisabled && { color: Colors.textDimmer },
        ]}
      >
        {date.day}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: '95%' as const,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellToday: {
    borderWidth: 2,
    borderRadius: 2,
    borderColor: Colors.teal,
  },
  dropWrap: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontSize: 16,
    color: Colors.text,
  },
});
