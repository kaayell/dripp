import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react-native';
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
  onToggleHidden: (taskId: number) => void;
};

export default function CalendarLegend({ tasks, onToggle, onToggleHidden }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { height: windowHeight } = useWindowDimensions();
  const targetHeight = windowHeight * (expanded ? 0.4 : 0.15);
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

  const visibleCount = tasks.length - tasks.filter((t) => t.hidden).length;

  const tasksByCategory = tasks.reduce((acc, task) => {
    const key = task.category?.name ?? 'uncategorized';
    const group = acc.get(key);
    if (group) group.push(task);
    else acc.set(key, [task]);
    return acc;
  }, new Map<string, TaskWithCategory[]>());

  return (
    <View style={styles.container}>
      <Pressable hitSlop={8} onPress={() => setExpanded((v) => !v)} style={styles.header}>
        <Label>
          {visibleCount} of {tasks.length} on calendar
        </Label>
        <View style={styles.expandToggle}>
          <Label style={[{ color: Colors.teal }]}>{expanded ? 'less' : 'more'}</Label>
          <Chevron color={Colors.teal} size={18} strokeWidth={2.25} />
        </View>
      </Pressable>

      <Animated.View style={listStyle}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {[...tasksByCategory].map(([categoryName, tasks]) => (
            <View key={categoryName} style={styles.categoryGroup}>
              <View style={styles.categoryRow}>
                <Label style={styles.categoryTitle}>{categoryName}</Label>
              </View>

              <View style={styles.taskRow}>
                {tasks.map((task) => {
                  const hidden = task.hidden;
                  const VisibilityIcon = hidden ? EyeOff : Eye;
                  return (
                    <View key={task.id} style={styles.taskCell}>
                      <AnimatedLabel
                        style={[
                          styles.taskContent,
                          { backgroundColor: dimmed(task.color, 10) },
                          hidden && styles.taskContentHidden,
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: '/task/[taskId]',
                            params: { taskId: String(task.id) },
                          })
                        }
                        onLongPress={() => toggleTask(task.id)}
                      >
                        <Drop
                          color={hidden ? 'transparent' : task.color}
                          size={12}
                          strokeColor={hidden ? task.color : undefined}
                        />
                        <Body
                          style={[styles.taskLabel, hidden && { color: Colors.label }]}
                          numberOfLines={1}
                        >
                          {task.name}
                        </Body>
                        <Pressable
                          hitSlop={8}
                          style={styles.visibilityButton}
                          onPress={() => onToggleHidden(task.id)}
                          accessibilityLabel={hidden ? `Show ${task.name}` : `Hide ${task.name}`}
                        >
                          <VisibilityIcon
                            color={hidden ? Colors.label : Colors.text}
                            size={20}
                            strokeWidth={1.75}
                          />
                        </Pressable>
                      </AnimatedLabel>
                    </View>
                  );
                })}
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
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xs,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: Spacing.xs,
  },
  categoryGroup: {
    paddingBottom: Spacing.xl,
  },
  categoryTitle: {
    fontSize: FontSize.base,
    letterSpacing: 0.5,
  },
  taskRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.md,
  },
  taskCell: {
    width: '49%',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
  },
  taskContentHidden: {
    backgroundColor: Colors.cellBg,
  },
  visibilityButton: {
    marginLeft: 'auto',
    alignSelf: 'center',
  },
  taskLabel: {
    flexShrink: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
});
