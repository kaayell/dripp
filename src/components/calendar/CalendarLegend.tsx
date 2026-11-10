import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { TaskWithCategory, toggleTaskLog } from '../../../db/queries';
import { Colors, dimmed, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { todayString } from '@/constants/dates';
import Drop from '@/components/ui/Drop';
import AnimatedLabel from '@/components/ui/AnimatedLabel';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Body, Label } from '@/components/ui/Typography';

type Props = {
  tasks: TaskWithCategory[];
  onToggle?: () => void;
};

export default function CalendarLegend({ tasks, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const targetHeight = expanded ? windowHeight * 0.35 : 96;
  const Chevron = expanded ? ChevronDown : ChevronUp;

  const listStyle = useAnimatedStyle(() => ({
    height: withTiming(targetHeight, { duration: 200 }),
  }));

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

  const tasksByCategory = tasks.reduce((acc, task) => {
    const key = task.category?.name ?? 'uncategorized';
    const group = acc.get(key);
    if (group) group.push(task);
    else acc.set(key, [task]);
    return acc;
  }, new Map<string, TaskWithCategory[]>());

  return (
    <View style={styles.container}>
      <Pressable hitSlop={8} onPress={() => setExpanded((v) => !v)} style={styles.expandButton}>
        <Chevron color={Colors.label} size={18} strokeWidth={2.25} />
      </Pressable>

      <Animated.View style={listStyle}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.legendContent}
        >
          {[...tasksByCategory].map(([categoryName, tasks]) => (
            <View key={categoryName} style={styles.categoryGroup}>
              <Label style={styles.categoryTitle}>{categoryName}</Label>

              <View style={styles.taskRow}>
                {tasks.map((task) => (
                  <View key={task.id} style={styles.taskCell}>
                    <AnimatedLabel
                      style={[styles.taskContent, { backgroundColor: dimmed(task.color, 10) }]}
                      onPress={() =>
                        router.push({
                          pathname: '/task/[taskId]',
                          params: { taskId: String(task.id) },
                        })
                      }
                      onLongPress={() => toggleTask(task.id)}
                    >
                      <Drop color={task.color} size={10} />
                      <Body style={styles.taskLabel}>{task.name}</Body>
                    </AnimatedLabel>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  expandButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  legendContent: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.md,
  },
  categoryGroup: {
    paddingBottom: Spacing.sm,
  },
  categoryTitle: {
    fontSize: FontSize.md,
    letterSpacing: 0.25,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.md,
  },
  taskCell: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  taskLabel: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: dimmed(Colors.text, 70),
  },
});
