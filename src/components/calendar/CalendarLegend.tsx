import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import type { Task } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import Drop from '@/components/ui/Drop';

export default function CalendarLegend({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.legendRow}
      contentContainerStyle={[styles.legendRowContent]}
    >
      {tasks.map((task) => (
        <Pressable
          key={task.id}
          style={styles.legendItem}
          onPress={() =>
            router.push({ pathname: '/task-detail', params: { taskId: String(task.id) } })
          }
        >
          <Drop color={task.color} size={8} />
          <Text style={[styles.legendLabel]}>{task.name}</Text>
        </Pressable>
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.label,
  },
});
