import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { loadTasksWithMostRecentLog, TaskWithMostRecentLog } from '../../../db/queries';
import { Colors, dimmed, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { timeSince } from '@/constants/dates';
import Drop from '@/components/ui/Drop';
import AnimatedLabel from '@/components/ui/AnimatedLabel';
import { router, useFocusEffect } from 'expo-router';

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

export default function LastDoneTasksScreen({
  selectedCategoryId,
}: {
  selectedCategoryId: number | null;
}) {
  const [tasks, setTasks] = useState<TaskWithMostRecentLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadTasksWithMostRecentLog()
        .then((loadedTasks) => setTasks(sortByLastDone(loadedTasks)))
        .catch((e) => console.error('[LastDoneTasksScreen] load failed', e));
    }, []),
  );

  const tasksForCategory = useCallback(
    (categoryId: number | null) =>
      categoryId == null ? tasks : tasks.filter((task) => task.categoryId === categoryId),
    [tasks],
  );

  const visibleTasks = useMemo(
    () => tasksForCategory(selectedCategoryId),
    [tasksForCategory, selectedCategoryId],
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Last Done</Text>
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
                  <Drop size={12} color={task.color} />
                  <Text style={styles.taskLabel}>{task.name}</Text>
                  <Text style={styles.taskCategoryLabel}>{task.category?.name}</Text>
                </View>
                <View style={styles.taskDetail}>
                  <Text style={[styles.taskLabel, { color: task.color }]}>
                    {mostRecentTaskLog ? timeSince(mostRecentTaskLog.date) : 'Never'}
                  </Text>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xl,
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
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  taskCategoryLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.label,
  },
});
