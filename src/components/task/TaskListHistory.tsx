import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Category, loadCategories, loadTasksWithHistory, TaskHistory } from '../../../db/queries';
import { ColorOpacityAlphas, Colors, OpacityPercent } from '@/constants/theme';
import Drop from '@/components/ui/Drop';
import { format, formatDistance, parseISO } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import CategoryFilter from '@/components/category/CategoryFilter';

function timeSince(dateString: string): string {
  const today = format(new Date(), 'yyyy-MM-dd');
  return formatDistance(parseISO(dateString), parseISO(today), { addSuffix: true });
}

function dimmed(color: string, opacity: OpacityPercent = 50): string {
  return `${color}${ColorOpacityAlphas[opacity]}`;
}

function sortByMostOverdue(tasks: TaskHistory[]): TaskHistory[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.mostRecentTrackedTask?.date;
    const bDate = b.mostRecentTrackedTask?.date;
    // never-tracked tasks sort last
    if (!aDate) return bDate ? 1 : 0;
    if (!bDate) return -1;
    return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
  });
}

export default function TaskListHistory() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskHistory[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadCategories(), loadTasksWithHistory()])
        .then(([loadedCategories, loadedTasks]) => {
          setCategories(loadedCategories);
          setTasks(sortByMostOverdue(loadedTasks));
        })
        .catch((e) => console.error('[TaskListHistory] load failed', e));
    }, []),
  );

  const selectCategory = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  }, []);

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
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
    >
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={selectCategory}
      />

      <Text style={[styles.taskSubLabel, { paddingVertical: 20 }]}>Most overdue first</Text>
      {visibleTasks.map((task) => {
        const mostRecentTrackedTask = task.mostRecentTrackedTask;
        return (
          <View
            key={task.id}
            style={[
              styles.taskContainer,
              { borderColor: dimmed(task.color, 30), backgroundColor: dimmed(task.color, 5) },
            ]}
          >
            <View style={styles.taskContentContainer}>
              <Drop size={16} color={dimmed(task.color, 70)} />
              <View style={styles.taskDetailsContainer}>
                <View style={styles.taskDetailRow}>
                  <Text style={styles.taskLabel}>{task.name}</Text>
                  <Text style={[styles.taskLabel, { color: dimmed(task.color, 80) }]}>
                    {mostRecentTrackedTask ? timeSince(mostRecentTrackedTask.date) : 'Never'}
                  </Text>
                </View>
                <View style={[styles.hr, { backgroundColor: dimmed(task.color, 70) }]} />
                <View style={styles.taskDetailRow}>
                  <Text style={styles.taskSubLabel}>{task.category?.name}</Text>

                  <Text style={styles.taskSubLabel}>
                    {mostRecentTrackedTask
                      ? format(parseISO(mostRecentTrackedTask.date), 'MMM dd')
                      : 'Nope'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  taskContentContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  taskDetailsContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 6,
  },
  taskDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  taskSubLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textDim,
  },
  hr: {
    height: 4,
    borderRadius: 8,
  },
});
