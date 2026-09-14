import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  createTaskLog,
  loadTasks,
  loadTaskLogsForDay,
  removeTaskLog,
  Task,
  TaskLog,
} from '../../../db/queries';
import { Colors } from '@/constants/theme';
import Drop from '@/components/ui/Drop';
import { FormSheet } from '@/components/ui/FormSheet';

function formatPickerDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function TaskPicker() {
  const { date, categoryId } = useLocalSearchParams<{ date: string; categoryId?: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);

  useEffect(() => {
    Promise.all([loadTasks(), loadTaskLogsForDay(date)])
      .then(([loadedTasks, loadedTaskLogs]) => {
        setTasks(loadedTasks);
        setTaskLogs(loadedTaskLogs);
      })
      .catch((e) => console.error('[TaskPicker] load failed', e));
  }, []);

  const visibleTasks = categoryId
    ? tasks.filter((task) => String(task.categoryId) === categoryId)
    : tasks;

  const toggleTask = useCallback(
    (taskId: number, taskLogId: number | undefined) => {
      if (taskLogId) {
        removeTaskLog(taskLogId)
          .then(() => {
            setTaskLogs((prev) => prev.filter((t) => t.id !== taskLogId));
          })
          .catch(() => {});
      } else {
        createTaskLog(taskId, date).then((created) => {
          setTaskLogs((prev) => [...prev, created]);
        });
      }
    },
    [date],
  );
  return (
    <FormSheet>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{formatPickerDate(date)}</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>

      {visibleTasks.map((task) => {
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
              <Text style={[styles.taskLabel, checked && styles.taskLabelActive]}>{task.name}</Text>
            </View>
            {checked && <Text style={[styles.checkmark, { color: task.color }]}>✓</Text>}
          </Pressable>
        );
      })}
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
