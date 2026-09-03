import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Task } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import Drop from '@/components/ui/Drop';

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
          <Drop color={task.color} size={8} />
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
    borderTopColor: Colors.border,
  },
  legendRowContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDim,
  },
});
