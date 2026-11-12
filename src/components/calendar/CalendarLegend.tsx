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
import VisibilityToggle from '@/components/ui/VisibilityToggle';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Body, Label } from '@/components/ui/Typography';

type Props = {
  tasks: TaskWithCategory[];
  onToggle?: () => void;
  onToggleHidden: (taskIds: number[], hidden: boolean) => void;
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
          {[...tasksByCategory].map(([categoryName, tasks]) => {
            const categoryHidden = tasks.every((t) => t.hidden);
            return (
              <View key={categoryName} style={styles.categoryGroup}>
                <View style={styles.categoryRow}>
                  <Label style={styles.categoryTitle}>{categoryName}</Label>
                  <VisibilityToggle
                    hidden={categoryHidden}
                    color={Colors.label}
                    onPress={() =>
                      onToggleHidden(
                        tasks.map((t) => t.id),
                        !categoryHidden,
                      )
                    }
                  />
                </View>

                <View style={styles.taskRow}>
                  {tasks.map((task) => {
                    const hidden = task.hidden;
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
                          <VisibilityToggle
                            hidden={hidden}
                            color={Colors.text}
                            hiddenColor={Colors.label}
                            style={styles.visibilityButton}
                            onPress={() => onToggleHidden([task.id], !hidden)}
                          />
                        </AnimatedLabel>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
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
    alignItems: 'center',
    paddingRight: Spacing.md,
    paddingLeft: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  categoryGroup: {
    paddingVertical: Spacing.md,
  },
  categoryTitle: {
    fontSize: FontSize.base,
    letterSpacing: 0.25,
  },
  taskRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.sm,
  },
  taskCell: {
    width: '49%',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderColor: Colors.border,
    borderWidth: 0.5,
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
