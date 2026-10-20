import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { parseISO } from 'date-fns';
import {
  loadTaskLogsForDay,
  loadTasksWithCategory,
  TaskLog,
  TaskWithCategory,
  toggleTaskLog,
} from '../../../db/queries';
import { Colors, dimmed, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import Drop from '@/components/ui/Drop';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { formatForDisplay } from '@/constants/dates.ts';
import { Body, ButtonText, Heading, Label } from '@/components/ui/Typography';

export default function TaskPicker() {
  const { date, categoryId } = useLocalSearchParams<{ date: string; categoryId?: string }>();
  const [tasks, setTasks] = useState<TaskWithCategory[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    Promise.all([loadTasksWithCategory(), loadTaskLogsForDay(date)])
      .then(([loadedTasks, loadedTaskLogs]) => {
        setTasks(loadedTasks);
        setTaskLogs(loadedTaskLogs);
      })
      .catch((e) => console.error('[TaskPicker] load failed', e));
  }, []);

  const visibleTasks = categoryId
    ? tasks.filter((task) => String(task.categoryId) === categoryId)
    : tasks;

  const tasksByCategory = visibleTasks.reduce((acc, task) => {
    const key = task.category?.name ?? 'uncategorized';
    const group = acc.get(key);
    if (group) group.push(task);
    else acc.set(key, [task]);
    return acc;
  }, new Map<string, TaskWithCategory[]>());

  const toggleTask = useCallback(
    (taskId: number, taskLogId: number | undefined) => {
      toggleTaskLog(taskId, date)
        .then((created) => {
          created
            ? setTaskLogs((prev) => [...prev, created])
            : setTaskLogs((prev) => prev.filter((t) => t.id !== taskLogId));
        })
        .catch(() => {});
    },
    [date],
  );
  return (
    <SafeAreaScreen sheet>
      <View style={styles.headerRow}>
        <Heading>{formatForDisplay(parseISO(date), 'EEEE, MMMM d')}</Heading>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ButtonText style={styles.doneText}>Done</ButtonText>
        </Pressable>
      </View>

      <ScrollView
        style={{ flexGrow: 0, maxHeight: windowHeight * 0.7 }}
        showsVerticalScrollIndicator={false}
      >
        {[...tasksByCategory].map(([categoryName, tasks]) => (
          <View key={categoryName} style={styles.categoryGroup}>
            <Label style={styles.categoryTitle}>{categoryName}</Label>
            {tasks.map((task) => {
              const existingId = taskLogs.find((t) => t.task_id === task.id)?.id;
              const checked = existingId != undefined;
              const color = task.color;
              return (
                <Pressable
                  key={task.id}
                  onPress={() => toggleTask(task.id, existingId)}
                  style={[
                    styles.taskRow,
                    {
                      backgroundColor: dimmed(color, checked ? 30 : 5),
                      borderColor: dimmed(color, checked ? 40 : 10),
                    },
                  ]}
                >
                  <View style={styles.taskLabelRow}>
                    <Drop size={10} color={color} />
                    <Body style={[styles.taskLabel, checked && styles.taskLabelActive]}>
                      {task.name}
                    </Body>
                  </View>
                  {checked && <Body style={[styles.checkmark]}>✓</Body>}
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.base,
  },
  doneText: {
    color: Colors.teal,
  },
  categoryGroup: {
    paddingBottom: Spacing.xs,
  },
  categoryTitle: {
    fontSize: FontSize.base,
    letterSpacing: 1.25,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
  },
  taskLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.base,
  },
  taskLabel: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.medium,
    color: Colors.label,
  },
  taskLabelActive: {
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  checkmark: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
});
