import { Pressable, StyleSheet, View } from 'react-native';
import type { DateData } from 'react-native-calendars';
import { Colors, dimmed, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
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
  const hasNote = !!marking?.hasNote;

  return (
    <Pressable
      disabled={isFuture}
      onPress={() => onPress?.(date)}
      onLongPress={() => onLongPress?.(date)}
      style={[styles.cell, isToday && styles.cellToday]}
    >
      {(marked || hasNote) && (
        <View style={styles.dropWrap}>
          <Drop
            color={
              marking?.color
                ? isDisabled
                  ? dimmed(marking.color, 15)
                  : marking.color
                : 'transparent'
            }
            size={18}
            strokeColor={hasNote ? (isDisabled ? Colors.disabled : Colors.text) : undefined}
          />
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
  cell: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderColor: Colors.background,
    backgroundColor: Colors.cellBg,
  },
  cellToday: {
    borderWidth: 2,
    borderRadius: Radius.sm,
    borderColor: Colors.teal,
  },
  dropWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: 6.5 }],
  },
  dayNum: {
    position: 'absolute',
    top: 3,
    right: 4,
    fontSize: FontSize.sm,
  },
});
