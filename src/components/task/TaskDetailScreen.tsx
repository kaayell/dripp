import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadTaskWithDetails, TaskWithDetails } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import { timeSince } from '@/constants/dates';
import { CloseButton } from '@/components/ui/CloseButton';
import { EditTaskButton } from '@/components/ui/EditTaskButton';
import Drop from '@/components/ui/Drop';
import Loading from '@/components/ui/Loading';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';

export default function TaskDetailScreen() {
  const insets = useSafeAreaInsets();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTaskWithDetails(Number(taskId))
        .then((loadedTask) => {
          if (!loadedTask) {
            router.back();
            return;
          }
          setTask(loadedTask);
        })
        .catch((e) => console.error('[TaskDetailScreen] load failed', e))
        .finally(() => setLoaded(true));
    }, [taskId]),
  );

  if (!loaded || !task) {
    return <Loading />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <CloseButton />,
          headerRight: () => <EditTaskButton taskId={task.id} />,
        }}
      />
      <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <Drop color={task.color} size={20} />
          <Text style={styles.title}>{task.name}</Text>
        </View>

        <Text style={styles.category}>{task.category?.name ?? 'no category'}</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statBlock, { borderColor: Colors.border }]}>
            <Text style={styles.statValue}>
              {task.taskLogs[0] ? timeSince(task.taskLogs[0]!.date) : 'never'}
            </Text>
            <Text style={styles.statLabel}>last done</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{task.taskLogs.length}</Text>
            <Text style={styles.statLabel}>times done</Text>
          </View>
        </View>
        <View style={styles.calendarCard}>
          <TaskCalendar color={task.color} taskLogs={task.taskLogs} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDim,
    textTransform: 'lowercase',
    marginBottom: 24,
    marginLeft: 30,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statBlock: {
    flex: 1,
    backgroundColor: Colors.cellBg,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDim,
    textTransform: 'uppercase',
  },
  calendarCard: {
    backgroundColor: Colors.cellBg,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
