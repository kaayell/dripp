import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Category,
  loadCategories,
  loadTasksWithMostRecentLog,
  TaskWithMostRecentLog,
} from '../../../db/queries';
import { Colors, dimmed, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { daysSince } from '@/constants/dates';
import Drop from '@/components/ui/Drop';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen.tsx';
import { Stack, useFocusEffect } from 'expo-router';
import CategoryFilter from '@/components/category/CategoryFilter';
import { CloseButton } from '@/components/ui/CloseButton';

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

export default function LastDoneTasksScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskWithMostRecentLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([loadCategories(), loadTasksWithMostRecentLog()])
        .then(([loadedCategories, loadedTasks]) => {
          setCategories(loadedCategories);
          setTasks(sortByLastDone(loadedTasks));
        })
        .catch((e) => console.error('[LastDoneTasksScreen] load failed', e));
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
          headerTitle: () => <Text style={styles.title}>Last Done</Text>,
        }}
      />
      <SafeAreaScreen>
        <ScrollView>
          {visibleTasks.map((task) => {
            const mostRecentTaskLog = task.mostRecentTaskLog;
            return (
              <View
                key={task.id}
                style={[
                  styles.taskContainer,
                  { borderColor: dimmed(task.color, 20), backgroundColor: dimmed(task.color, 5) },
                ]}
              >
                <View style={styles.taskRow}>
                  <View style={styles.taskDetail}>
                    <Drop size={12} color={task.color} />
                    <Text style={styles.taskLabel}>{task.name}</Text>
                    <Text style={styles.taskCategoryLabel}>{task.category?.name}</Text>
                  </View>
                  <View style={styles.taskDetail}>
                    <Text style={[styles.taskLabel, { color: task.color }]}>
                      {mostRecentTaskLog ? daysSince(mostRecentTaskLog.date) : 'Never'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.categoryContainer}>
          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={selectCategory}
          />
        </View>
      </SafeAreaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingLeft: Spacing.xxl,
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
  categoryContainer: {
    paddingTop: Spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
