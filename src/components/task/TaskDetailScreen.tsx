import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen.tsx';
import { loadTaskWithDetails, TaskWithDetails } from '../../../db/queries';
import { Colors, dimmed, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import { formatDisplayTime, formatShortDate, parseTime, timeSince } from '@/constants/dates';
import { CloseButton } from '@/components/ui/CloseButton';
import Drop from '@/components/ui/Drop';
import Loading from '@/components/ui/Loading';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';
import { TaskCalendarHeatmap } from '@/components/calendar/TaskCalendarHeatmap';
import { TaskNotes } from '@/components/task/TaskNotes';
import { Bell, SquarePen } from 'lucide-react-native';
import { IconButton } from '@/components/ui/IconButton';
import { computeNextReminder } from '@/notifications/reminderDates';
import { Body, Caption, ChipText, Title } from '@/components/ui/Typography';

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const loadedTask = await loadTaskWithDetails(Number(taskId));
    if (!loadedTask) {
      router.back();
      return;
    }
    setTask(loadedTask);
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      refresh()
        .catch((e) => console.error('[TaskDetailScreen] load failed', e))
        .finally(() => setLoaded(true));
    }, [refresh]),
  );

  if (!loaded || !task) {
    return <Loading />;
  }

  const nextReminder = task.reminder
    ? computeNextReminder(parseTime(task.reminder.time), task.reminder)
    : null;
  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <CloseButton />,
          headerRight: () => (
            <IconButton
              testID="edit-task-button"
              onPress={() =>
                router.push({ pathname: '/task/edit', params: { taskId: String(taskId) } })
              }
              icon={<SquarePen color={Colors.icon} size={18} strokeWidth={2.25} />}
            />
          ),
        }}
      />
      <SafeAreaScreen scroll>
        <View style={styles.header}>
          <View style={styles.metaContainer}>
            <Drop color={task.color} size={28} />
            <View style={styles.titleGroup}>
              <Title>{task.name}</Title>
              <Body style={styles.category}>{task.category?.name ?? 'no category'}</Body>
            </View>
          </View>
          <View style={styles.timeLabels}>
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
                <ChipText
                  style={styles.lastDoneText}
                >{`${timeSince(task.taskLogs[0]!.date)}`}</ChipText>
              </View>
            )}
            {nextReminder && (
              <View style={styles.nextReminder}>
                <Bell color={Colors.label} size={13} strokeWidth={2.25} />
                <Caption style={styles.nextReminderText}>
                  {`${formatShortDate(nextReminder)} at ${formatDisplayTime(nextReminder)}`}
                </Caption>
              </View>
            )}
          </View>
        </View>
        <View style={styles.taskDetailsContainer}>
          <View style={styles.detailCard}>
            <TaskCalendarHeatmap color={task.color} taskLogs={task.taskLogs} />
          </View>
          <View style={styles.detailCard}>
            <TaskCalendar
              taskId={task.id}
              color={task.color}
              taskLogs={task.taskLogs}
              taskNotes={task.taskNotes}
              onToggle={refresh}
            />
          </View>
          <View style={styles.detailCard}>
            <TaskNotes taskId={task.id} color={task.color} taskNotes={task.taskNotes} />
          </View>
        </View>
      </SafeAreaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    flexShrink: 1,
  },
  titleGroup: {
    flexShrink: 1,
  },
  timeLabels: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  category: {
    fontWeight: FontWeight.semibold,
    color: Colors.label,
    fontSize: FontSize.lg,
    textTransform: 'lowercase',
  },
  lastDonePill: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.md,
  },
  lastDoneText: {
    color: Colors.text,
  },
  nextReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nextReminderText: {
    fontSize: FontSize.md,
  },
  taskDetailsContainer: {
    flexDirection: 'column',
    gap: Spacing.xl,
  },
  detailCard: {
    ...CommonStyles.surface,
    overflow: 'hidden',
  },
});
