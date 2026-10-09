import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { parseISO } from 'date-fns';
import {
  loadTaskLogsForDay,
  loadTasksWithCategory,
  TaskLog,
  TaskWithCategory,
  toggleTaskLog,
} from '../../../db/queries';
import { Colors } from '@/constants/theme';
import Drop from '@/components/ui/Drop';
import { FormSheet } from '@/components/ui/FormSheet';
import { formatForDisplay } from '@/constants/dates.ts';

export default function TaskPicker() {
  const { date, categoryId } = useLocalSearchParams<{ date: string; categoryId?: string }>();
  const [tasks, setTasks] = useState<TaskWithCategory[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);

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
    <FormSheet>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{formatForDisplay(parseISO(date), 'EEEE, MMMM d')}</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>

      {[...tasksByCategory].map(([categoryName, tasks]) => (
        <View key={categoryName} style={styles.categoryGroup}>
          <Text style={styles.categoryTitle}>{categoryName}</Text>
          {tasks.map((task) => {
            const existingId = taskLogs.find((t) => t.task_id === task.id)?.id;
            const checked = existingId != undefined;
            return (
              <Pressable
                key={task.id}
                onPress={() => toggleTask(task.id, existingId)}
                style={[styles.taskRow, checked && { backgroundColor: Colors.border }]}
              >
                <View style={styles.taskLabelRow}>
                  <Drop size={8} color={task.color} />
                  <Text style={[styles.taskLabel, checked && styles.taskLabelActive]}>
                    {task.name}
                  </Text>
                </View>
                {checked && <Text style={[styles.checkmark, { color: task.color }]}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      ))}
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.teal,
  },
  categoryGroup: {
    paddingBottom: 4,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  taskLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  taskLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.label,
  },
  taskLabelActive: {
    fontWeight: '700',
    color: Colors.text,
  },
  checkmark: {
    fontSize: 15,
    fontWeight: '700',
  },
});
