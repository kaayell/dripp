import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  loadTasksWithMostRecentLog,
  TaskWithMostRecentLog,
  toggleTaskLog,
} from '../../../db/queries';
import { Colors, dimmed, FontSize, Radius, Spacing } from '@/constants/theme';
import { timeSinceParts, todayString } from '@/constants/dates';
import * as Haptics from 'expo-haptics';
import Drop from '@/components/ui/Drop';
import AnimatedLabel from '@/components/ui/AnimatedLabel';
import { router, useFocusEffect } from 'expo-router';
import { ArrowDown, ArrowUp, Bell, Check } from 'lucide-react-native';
import { Caption, ChipText, ItemTitle, Label, Title } from '@/components/ui/Typography';
import { CommonStyles } from '@/constants/styles';

type SortDirection = 'asc' | 'desc';

function sortByLastDone(tasks: TaskWithMostRecentLog[], direction: SortDirection) {
  const sign = direction === 'asc' ? 1 : -1;
  return [...tasks].sort((a, b) => {
    const aDate = a.mostRecentTaskLog?.date;
    const bDate = b.mostRecentTaskLog?.date;
    // never-tracked tasks sort last
    if (!aDate) return bDate ? 1 : 0;
    if (!bDate) return -1;
    return sign * (aDate < bDate ? -1 : aDate > bDate ? 1 : 0);
  });
}

export default function TasksScreen({ selectedCategoryId }: { selectedCategoryId: number | null }) {
  const [tasks, setTasks] = useState<TaskWithMostRecentLog[]>([]);
  const [sortActive, setSortActive] = useState(true);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const refresh = useCallback(async () => {
    setTasks(await loadTasksWithMostRecentLog());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().catch((e) => console.error('[TasksScreen] load failed', e));
    }, [refresh]),
  );

  const toggleToday = useCallback(
    (taskId: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toggleTaskLog(taskId, todayString())
        .then(refresh)
        .catch((e) => console.error('[TasksScreen] toggle failed', e));
    },
    [refresh],
  );

  const tasksForCategory = useCallback(
    (categoryId: number | null) =>
      categoryId == null ? tasks : tasks.filter((task) => task.categoryId === categoryId),
    [tasks],
  );

  const visibleTasks = useMemo(() => {
    const filtered = tasksForCategory(selectedCategoryId);
    return sortActive ? sortByLastDone(filtered, sortDirection) : filtered;
  }, [tasksForCategory, selectedCategoryId, sortActive, sortDirection]);

  return (
    <View style={styles.screen}>
      <View style={styles.titleRow}>
        <Title>Tasks</Title>
        <Caption style={{ fontSize: FontSize.lg }}>{visibleTasks.length}</Caption>
      </View>
      <View style={styles.sortRow}>
        <Pressable
          style={[styles.sortChip, sortActive && styles.sortChipActive]}
          onPress={() => setSortActive((active) => !active)}
        >
          <ChipText style={[styles.sortChipText, sortActive && styles.sortChipTextActive]}>
            Last Done
          </ChipText>
        </Pressable>
        {sortActive && (
          <Pressable
            hitSlop={8}
            style={[styles.sortChip, styles.sortDirectionButton]}
            onPress={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
          >
            {sortDirection === 'asc' ? (
              <ArrowDown size={14} color={Colors.text} />
            ) : (
              <ArrowUp size={14} color={Colors.text} />
            )}
            <ChipText style={styles.sortDirectionText}>
              {sortDirection === 'asc' ? 'Oldest first' : 'Newest first'}
            </ChipText>
          </Pressable>
        )}
      </View>
      <ScrollView>
        {visibleTasks.map((task) => {
          const mostRecentTaskLog = task.mostRecentTaskLog;
          const lastDone = mostRecentTaskLog
            ? timeSinceParts(mostRecentTaskLog.date)
            : { value: 'Never', suffix: null };
          const doneToday = mostRecentTaskLog?.date === todayString();
          return (
            <AnimatedLabel
              key={task.id}
              style={[
                styles.taskContainer,
                { borderColor: dimmed(task.color, 40), backgroundColor: dimmed(task.color, 5) },
              ]}
              onPress={() =>
                router.push({ pathname: '/task/[taskId]', params: { taskId: String(task.id) } })
              }
            >
              <View style={styles.taskRowContainer}>
                <View style={styles.taskDescriptions}>
                  <View style={{ flexDirection: 'column' }}>
                    <View style={styles.taskTitle}>
                      <Drop size={12} color={task.color} />
                      <ItemTitle style={styles.taskLabel}>{task.name}</ItemTitle>
                      {task.reminder && <Bell size={16} color={Colors.label} strokeWidth={3} />}
                    </View>
                    {task.category && (
                      <Label style={styles.taskCategoryLabel}>{task.category?.name}</Label>
                    )}
                  </View>
                </View>
                <View style={styles.taskActions}>
                  <View style={styles.lastDone}>
                    <ItemTitle style={[styles.taskLabel, { color: task.color }]}>
                      {lastDone.value}
                    </ItemTitle>
                    {lastDone.suffix && (
                      <Label style={styles.taskCategoryLabel}>{lastDone.suffix}</Label>
                    )}
                  </View>
                  <Pressable
                    hitSlop={8}
                    onPress={() => toggleToday(task.id)}
                    style={[
                      styles.checkbox,
                      { borderColor: dimmed(task.color, 50) },
                      doneToday && { backgroundColor: task.color },
                    ]}
                  >
                    {doneToday && <Check color={Colors.background} size={24} strokeWidth={4} />}
                  </Pressable>
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
  sortChipText: {
    fontWeight: '700',
  },
  sortDirectionButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sortDirectionText: {
    color: Colors.text,
    fontWeight: '700',
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
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  taskRowContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskDescriptions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastDone: {
    alignItems: 'flex-end',
  },
  taskLabel: {
    fontSize: FontSize.xxl,
  },
  taskCategoryLabel: {
    fontSize: FontSize.base,
    letterSpacing: 0.5,
  },
});
