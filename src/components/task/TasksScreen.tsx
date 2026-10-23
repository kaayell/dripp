import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { loadTasksWithMostRecentLog, TaskWithMostRecentLog } from '../../../db/queries';
import { Colors, dimmed, FontSize, Radius, Spacing } from '@/constants/theme';
import { timeSince } from '@/constants/dates';
import Drop from '@/components/ui/Drop';
import AnimatedLabel from '@/components/ui/AnimatedLabel';
import { router, useFocusEffect } from 'expo-router';
import { Caption, ChipText, Hint, ItemTitle, Label, Title } from '@/components/ui/Typography';
import { CommonStyles } from '@/constants/styles';

type SortOption = 'lastDone' | 'category';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'lastDone', label: 'Last Done' },
  { value: 'category', label: 'Category' },
];

function sortByCategory(tasks: TaskWithMostRecentLog[]): TaskWithMostRecentLog[] {
  return [...tasks].sort((a, b) => {
    const aName = a.category?.name;
    const bName = b.category?.name;
    // uncategorized tasks sort last
    if (!aName) return bName ? 1 : 0;
    if (!bName) return -1;
    return aName.localeCompare(bName, undefined, { sensitivity: 'base' });
  });
}

function sortByLastDone(tasks: TaskWithMostRecentLog[]): TaskWithMostRecentLog[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.mostRecentTaskLog?.date;
    const bDate = b.mostRecentTaskLog?.date;
    // never-tracked tasks sort last
    if (!aDate) return bDate ? 1 : 0;
    if (!bDate) return -1;
    return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
  });
}

const SORTERS: Record<SortOption, (tasks: TaskWithMostRecentLog[]) => TaskWithMostRecentLog[]> = {
  category: sortByCategory,
  lastDone: sortByLastDone,
};

export default function TasksScreen({ selectedCategoryId }: { selectedCategoryId: number | null }) {
  const [tasks, setTasks] = useState<TaskWithMostRecentLog[]>([]);
  const [sortBy, setSortBy] = useState<SortOption | null>('lastDone');

  useFocusEffect(
    useCallback(() => {
      loadTasksWithMostRecentLog()
        .then(setTasks)
        .catch((e) => console.error('[TasksScreen] load failed', e));
    }, []),
  );

  const tasksForCategory = useCallback(
    (categoryId: number | null) =>
      categoryId == null ? tasks : tasks.filter((task) => task.categoryId === categoryId),
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    const filtered = tasksForCategory(selectedCategoryId);
    return sortBy ? SORTERS[sortBy](filtered) : filtered;
  }, [tasksForCategory, selectedCategoryId, sortBy]);

  return (
    <View style={styles.screen}>
      <View style={styles.titleRow}>
        <Title>Tasks</Title>
        <Caption style={{ fontSize: FontSize.lg }}>{visibleTasks.length}</Caption>
      </View>
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((option) => {
          const active = option.value === sortBy;
          return (
            <Pressable
              key={option.value}
              style={[styles.sortChip, active && styles.sortChipActive]}
              onPress={() => setSortBy(active ? null : option.value)}
            >
              <ChipText style={active && styles.sortChipTextActive}>{option.label}</ChipText>
            </Pressable>
          );
        })}
      </View>
      <ScrollView>
        {visibleTasks.map((task) => {
          const mostRecentTaskLog = task.mostRecentTaskLog;
          return (
            <AnimatedLabel
              key={task.id}
              style={[
                styles.taskContainer,
                { borderColor: dimmed(task.color, 20), backgroundColor: dimmed(task.color, 5) },
              ]}
              onPress={() =>
                router.push({ pathname: '/task/[taskId]', params: { taskId: String(task.id) } })
              }
            >
              <View style={styles.taskRow}>
                <View style={styles.taskDetail}>
                  <View style={{ flexDirection: 'column' }}>
                    {task.category && (
                      <Label style={styles.taskCategoryLabel}>{task.category?.name}</Label>
                    )}
                    <View style={styles.taskTitle}>
                      <Drop size={12} color={task.color} />
                      <ItemTitle style={styles.taskLabel}>{task.name}</ItemTitle>
                    </View>
                  </View>
                </View>
                <View style={styles.taskDetail}>
                  <ItemTitle style={[styles.taskLabel, { color: task.color }]}>
                    {mostRecentTaskLog ? timeSince(mostRecentTaskLog.date) : 'Never'}
                  </ItemTitle>
                </View>
              </View>
            </AnimatedLabel>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  taskTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.md,
  },
  sortRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: Spacing.lg,
  },
  sortChip: {
    ...CommonStyles.surface,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  sortChipActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  sortChipTextActive: {
    color: Colors.background,
  },
  taskContainer: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  taskRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.base,
  },
  taskDetail: {
    flexDirection: 'row',
    gap: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskLabel: {
    fontSize: FontSize.xxl,
  },
  taskCategoryLabel: {
    fontSize: FontSize.lg,
  },
});
