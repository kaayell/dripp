import { Pressable, StyleSheet, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Colors, FontSize, FontWeight, Radius } from '@/constants/theme';
import { todayString } from '@/constants/dates';
import Drop from '@/components/ui/Drop';
import { DayNumber } from '@/components/ui/Typography';

type Marking = { color?: string; dim?: boolean; hasNote?: boolean };

export default function TaskCalendarDay({
  date,
  state,
  marking,
  onPress,
  onLongPress,
}: {
  date?: DateData;
  state?: string;
  marking?: Marking;
  onPress?: (date: DateData) => void;
  onLongPress?: (date: DateData) => void;
}) {
  if (!date) return null;
  const isToday = state === 'today';
  const isDisabled = state === 'disabled';
  const isFuture = date.dateString > todayString();
  const marked = !!marking?.color;

  return (
    <Pressable
      disabled={isFuture}
      onPress={() => onPress?.(date)}
      onLongPress={() => onLongPress?.(date)}
      style={[styles.cell, isToday && styles.cellToday]}
    >
      {marked && (
        <View style={styles.dropWrap}>
          <Drop color={marking!.color} size={32} />
        </View>
      )}
      <DayNumber
        style={[
          styles.dayNum,
          marked && { fontWeight: FontWeight.bold },
          isDisabled && { color: Colors.disabled },
        ]}
      >
        {date.day}
      </DayNumber>
      {marking?.hasNote && <View style={[styles.noteDot, isDisabled && styles.noteDotDisabled]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellToday: {
    borderWidth: 2,
    borderRadius: Radius.sm,
    borderColor: Colors.teal,
  },
  dropWrap: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.text,
  },
  noteDotDisabled: {
    backgroundColor: Colors.disabled,
  },
  dayNum: {
    fontSize: FontSize.lg,
  },
});
