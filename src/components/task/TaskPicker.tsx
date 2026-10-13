import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { parseISO } from 'date-fns';
import {
  loadTaskLogsForDay,
  loadTasksWithCategory,
  TaskLog,
  TaskWithCategory,
  toggleTaskLog,
} from '../../../db/queries';
import { Colors, dimmed } from '@/constants/theme';
import Drop from '@/components/ui/Drop';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { formatForDisplay } from '@/constants/dates.ts';

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
        <Text style={styles.title}>{formatForDisplay(parseISO(date), 'EEEE, MMMM d')}</Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flexGrow: 0, maxHeight: windowHeight * 0.7 }}
        showsVerticalScrollIndicator={false}
      >
        {[...tasksByCategory].map(([categoryName, tasks]) => (
          <View key={categoryName} style={styles.categoryGroup}>
            <Text style={styles.categoryTitle}>{categoryName}</Text>
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
                    <Text style={[styles.taskLabel, checked && styles.taskLabelActive]}>
                      {task.name}
                    </Text>
                  </View>
                  {checked && <Text style={[styles.checkmark]}>✓</Text>}
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
    paddingHorizontal: 4,
    paddingVertical: 10,
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
    fontSize: 14,
    fontWeight: '700',
    color: Colors.label,
    textTransform: 'uppercase',
    letterSpacing: 1.25,
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
    color: Colors.text,
  },
});
