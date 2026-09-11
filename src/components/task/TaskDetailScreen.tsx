import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadTaskWithDetails, TaskWithDetails } from '../../../db/queries';
import { Colors, dimmed } from '@/constants/theme';
import { timeSince } from '@/constants/dates';
import { CloseButton } from '@/components/ui/CloseButton';
import { EditTaskButton } from '@/components/ui/EditTaskButton';
import Drop from '@/components/ui/Drop';
import Loading from '@/components/ui/Loading';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';
import { TaskCalendarHeatmap } from '@/components/calendar/TaskCalendarHeatmap';

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
          <View style={styles.metaContainer}>
            <Drop color={task.color} size={32} />
            <View>
              <Text style={styles.title}>{task.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.category}>{task.category?.name ?? 'no category'}</Text>
                {task.taskLogs[0] && (
                  <View
                    style={[
                      styles.lastDonePill,
                      {
                        backgroundColor: dimmed(task.color, 20),
                        borderColor: dimmed(task.color, 40),
                      },
                    ]}
                  >
                    <Text style={styles.lastDoneText}>
                      {`${timeSince(task.taskLogs[0]!.date)}`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
        <View style={styles.calendarsContainer}>
          <View style={styles.calendarCard}>
            <TaskCalendarHeatmap color={task.color} taskLogs={task.taskLogs} />
          </View>
          <View style={styles.calendarCard}>
            <TaskCalendar taskId={task.id} color={task.color} taskLogs={task.taskLogs} />
          </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDim,
    textTransform: 'lowercase',
  },
  lastDonePill: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 50,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  lastDoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'lowercase',
  },
  calendarsContainer: {
    flexDirection: 'column',
    gap: 14,
  },
  calendarCard: {
    backgroundColor: Colors.cellBg,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
  },
});
