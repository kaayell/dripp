import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Task, toggleTaskLog } from '../../../db/queries';
import { Colors, dimmed } from '@/constants/theme';
import Drop from '@/components/ui/Drop';

type Props = {
  tasks: Task[];
  onToggle?: () => void;
};

export default function CalendarLegend({ tasks, onToggle }: Props) {
  const toggleTask = useCallback(
    (taskId: number) => {
      const today = new Date().toLocaleDateString('sv');

      toggleTaskLog(taskId, today)
        .then(() => onToggle?.())
        .catch(() => {});
    },
    [onToggle],
  );

  if (tasks.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.legendRow}
      contentContainerStyle={styles.legendRowContent}
    >
      {tasks.map((task) => (
        <Pressable
          key={task.id}
          style={[styles.legendItem, { borderColor: dimmed(task.color, 40) }]}
          onPress={() =>
            router.push({ pathname: '/task-detail', params: { taskId: String(task.id) } })
          }
          onLongPress={() => toggleTask(task.id)}
        >
          <Drop color={task.color} size={10} />
          <Text style={styles.legendLabel}>{task.name}</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.label,
  },
});
