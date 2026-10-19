import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Task, toggleTaskLog } from '../../../db/queries';
import { Colors, dimmed, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { todayString } from '@/constants/dates';
import Drop from '@/components/ui/Drop';
import AnimatedLabel from '@/components/ui/AnimatedLabel';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';

type Props = {
  tasks: Task[];
  onToggle?: () => void;
};

export default function CalendarLegend({ tasks, onToggle }: Props) {
  const toggleTask = useCallback(
    (taskId: number) => {
      const today = todayString();

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
        <Animated.View key={task.id} entering={SlideInRight} exiting={SlideOutRight}>
          <AnimatedLabel
            style={[styles.legendItem, { backgroundColor: dimmed(task.color, 10) }]}
            onPress={() =>
              router.push({ pathname: '/task/[taskId]', params: { taskId: String(task.id) } })
            }
            onLongPress={() => toggleTask(task.id)}
          >
            <Drop color={task.color} size={10} />
            <Text style={styles.legendLabel}>{task.name}</Text>
          </AnimatedLabel>
        </Animated.View>
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
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: dimmed(Colors.text, 70),
  },
});
