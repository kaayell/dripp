import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Category,
  loadCategories,
  loadTasksWithMostRecentLog,
  TaskWithMostRecentLog,
} from '../../../db/queries';
import { Colors, dimmed } from '@/constants/theme';
import { timeSince } from '@/constants/dates';
import Drop from '@/components/ui/Drop';
import { format, parseISO } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useFocusEffect } from 'expo-router';
import CategoryFilter from '@/components/category/CategoryFilter';
import { CloseButton } from '@/components/ui/CloseButton';

function sortByMostOverdue(tasks: TaskWithMostRecentLog[]): TaskWithMostRecentLog[] {
  return [...tasks].sort((a, b) => {
    const aDate = a.mostRecentTaskLog?.date;
    const bDate = b.mostRecentTaskLog?.date;
    // never-tracked tasks sort last
    if (!aDate) return bDate ? 1 : 0;
    if (!bDate) return -1;
    return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
  });
}

export default function OverdueTasksScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskWithMostRecentLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadCategories(), loadTasksWithMostRecentLog()])
        .then(([loadedCategories, loadedTasks]) => {
          setCategories(loadedCategories);
          setTasks(sortByMostOverdue(loadedTasks));
        })
        .catch((e) => console.error('[OverdueTasksScreen] load failed', e));
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
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <CloseButton />,
        }}
      />
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
          const mostRecentTaskLog = task.mostRecentTaskLog;
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
                      {mostRecentTaskLog ? timeSince(mostRecentTaskLog.date) : 'Never'}
                    </Text>
                  </View>
                  <View style={[styles.hr, { backgroundColor: dimmed(task.color, 70) }]} />
                  <View style={styles.taskDetailRow}>
                    <Text style={styles.taskSubLabel}>{task.category?.name}</Text>

                    <Text style={styles.taskSubLabel}>
                      {mostRecentTaskLog
                        ? format(parseISO(mostRecentTaskLog.date), 'MMM dd')
                        : 'Nope'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </>
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
    color: Colors.label,
  },
  hr: {
    height: 4,
    borderRadius: 8,
  },
});
