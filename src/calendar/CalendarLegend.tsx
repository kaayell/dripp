import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Task } from '../../db/queries';
import { BORDER, TEXT_DIM } from '../theme';

type Props = {
  tasks: Task[];
  bottomInset?: number;
};

export default function CalendarLegend({ tasks, bottomInset = 0 }: Props) {
  if (tasks.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.legendRow}
      contentContainerStyle={[styles.legendRowContent, { paddingBottom: bottomInset + 12 }]}
    >
      {tasks.map((task) => (
        <View key={task.id} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: task.color }]} />
          <Text style={styles.legendLabel}>{task.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  legendRow: {
    flexGrow: 0,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  legendRowContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_DIM,
  },
});
