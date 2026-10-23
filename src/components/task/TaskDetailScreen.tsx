import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen.tsx';
import { loadTaskWithDetails, TaskWithDetails, toggleTaskLog } from '../../../db/queries';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';
import { formatDisplayTime, formatShortDate, timeSince, todayString } from '@/constants/dates';
import * as Haptics from 'expo-haptics';
import { CloseButton } from '@/components/ui/CloseButton';
import Drop from '@/components/ui/Drop';
import Loading from '@/components/ui/Loading';
import { TaskCalendar } from '@/components/calendar/TaskCalendar';
import { TaskActivity } from '@/components/task/TaskActivity';
import { TaskNotes } from '@/components/task/TaskNotes';
import { Check, SquarePen } from 'lucide-react-native';
import { IconButton } from '@/components/ui/IconButton';
import { loadNextReminderDate } from '@/notifications/reminders';
import { Label, Title } from '@/components/ui/Typography';

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [task, setTask] = useState<TaskWithDetails | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [nextReminder, setNextReminder] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    const loadedTask = await loadTaskWithDetails(Number(taskId));
    if (!loadedTask) {
      router.back();
      return;
    }
    setTask(loadedTask);
    setNextReminder(await loadNextReminderDate(loadedTask));
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      refresh()
        .catch((e) => console.error('[TaskDetailScreen] load failed', e))
        .finally(() => setLoaded(true));
    }, [refresh]),
  );

  const toggleToday = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleTaskLog(Number(taskId), todayString())
      .then(refresh)
      .catch((e) => console.error('[TaskDetailScreen] toggle failed', e));
  }, [taskId, refresh]);

  if (!loaded || !task) {
    return <Loading />;
  }

  const today = todayString();
  const doneToday = task.taskLogs.some((log) => log.date === today);
  const categoryName = task.category?.name;

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
        <View style={[styles.header, { borderBottomColor: task.color }]}>
          <View style={[styles.headerGroup, styles.titleRow]}>
            <View style={styles.titleColumn}>
              {categoryName && <Label style={styles.category}>{categoryName}</Label>}
              <View style={styles.titleGroup}>
                <Drop color={task.color} size={20} />
                <Title>{task.name}</Title>
              </View>
            </View>
            <Pressable
              hitSlop={12}
              onPress={toggleToday}
              style={[
                styles.checkbox,
                { borderColor: task.color },
                doneToday && { backgroundColor: task.color },
              ]}
            >
              {doneToday && <Check color={Colors.background} size={20} strokeWidth={3} />}
            </Pressable>
          </View>
          <View style={styles.headerGroup}>
            <View style={styles.timeGroup}>
              {task.taskLogs[0] && (
                <View style={styles.timeLabels}>
                  <Label>Last</Label>
                  <Label
                    style={{ color: task.color }}
                  >{`${timeSince(task.taskLogs[0]!.date)}`}</Label>
                </View>
              )}
              {nextReminder && (
                <View style={[styles.timeLabels, { marginLeft: 'auto' }]}>
                  <Label>Next</Label>
                  <Label style={{ color: task.color }}>
                    {`${formatShortDate(nextReminder)} @ ${formatDisplayTime(nextReminder)}`}
                  </Label>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.taskDetailsContainer}>
          <View
            style={[styles.detailCard, { borderBottomWidth: 2, borderBottomColor: Colors.text }]}
          >
            <TaskCalendar
              taskId={task.id}
              color={task.color}
              taskLogs={task.taskLogs}
              taskNotes={task.taskNotes}
              onToggle={refresh}
            />
            <TaskNotes taskId={task.id} color={task.color} taskNotes={task.taskNotes} />
          </View>
          <View style={styles.detailCard}>
            <TaskActivity color={task.color} taskLogs={task.taskLogs} taskNotes={task.taskNotes} />
          </View>
        </View>
      </SafeAreaScreen>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'column',
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 2,
    marginBottom: Spacing.xl,
  },
  headerGroup: {
    flexDirection: 'row',
  },
  titleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleColumn: {
    flexShrink: 1,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.md,
  },
  timeGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabels: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.md,
  },
  category: {
    fontWeight: FontWeight.semibold,
    color: Colors.label,
    fontSize: FontSize.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.1,
  },
  taskDetailsContainer: {
    flexDirection: 'column',
    gap: Spacing.xl,
  },
  detailCard: {
    gap: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});
