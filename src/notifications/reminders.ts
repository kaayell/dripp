import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  loadTask,
  loadTaskReminder,
  loadTasksWithDatedReminders,
  Reminder,
  ReminderInputValues,
  setTaskReminder,
  Task,
  TaskWithReminder,
} from '../../db/queries';
import {
  REMINDER_CHANNEL,
  reminderIdentifier,
  TASK_REMINDER_CATEGORY,
} from '@/constants/notifications';
import { format, parse } from 'date-fns';
import { computeReminderSchedule } from '@/notifications/reminderDates';

const DATED_OCCURRENCES = 4;

async function setNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
    name: 'Dripp Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function buildRepeatingTrigger(
  reminder: Reminder,
): Notifications.SchedulableNotificationTriggerInput {
  const [hour, minute] = reminder.time.split(':').map(Number);

  if (reminder.type === 'weekly' && reminder.dayOfWeek != null) {
    return {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: reminder.dayOfWeek + 1,
      hour,
      minute,
    };
  }

  if (reminder.type === 'monthly' && reminder.dayOfMonth != null) {
    return {
      type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
      day: reminder.dayOfMonth,
      hour,
      minute,
    };
  }

  return {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  };
}

function buildContent(task: Task, reminder: Reminder) {
  return {
    title: task.name,
    categoryIdentifier: TASK_REMINDER_CATEGORY,
    data: { taskId: task.id, reminderType: reminder.type },
  };
}

async function scheduleDatedNotifications(task: Task, reminder: Reminder, dates: Date[]) {
  const content = buildContent(task, reminder);
  for (const date of dates) {
    const targetDate = format(date, 'yyyy-MM-dd');
    await Notifications.scheduleNotificationAsync({
      identifier: reminderIdentifier(task.id, targetDate),
      content: { ...content, data: { ...content.data, targetDate } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
  }
}

async function scheduleTaskNotifications(task: TaskWithReminder) {
  if (!task.reminder) return;

  const reminder = task.reminder;

  await setNotificationChannel();

  if (reminder.interval > 1) {
    const startDate = parse(reminder.time, 'HH:mm', new Date());
    const nextReminderDates = computeReminderSchedule(startDate, reminder, DATED_OCCURRENCES);
    await scheduleDatedNotifications(task, reminder, nextReminderDates);
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: reminderIdentifier(task.id),
    content: buildContent(task, reminder),
    trigger: buildRepeatingTrigger(reminder),
  });
}

async function cancelTaskNotifications(taskId: number) {
  for (const { identifier } of await existingTaskNotifications(taskId)) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
}

async function existingTaskNotifications(
  taskId: number,
): Promise<Notifications.NotificationRequest[]> {
  const prefix = reminderIdentifier(taskId);
  const targetDate = (n: Notifications.NotificationRequest) =>
    String(n.content.data?.targetDate ?? '');
  return (await Notifications.getAllScheduledNotificationsAsync())
    .filter(({ identifier }) => identifier === prefix || identifier.startsWith(`${prefix}-`))
    .sort((a, b) => targetDate(a).localeCompare(targetDate(b)));
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function saveTaskReminder(taskId: number, reminder: ReminderInputValues | null) {
  const hasExistingReminder = reminder ? await loadTaskReminder(taskId) : null;
  if (hasExistingReminder) {
    await cancelTaskNotifications(taskId);
  }

  await setTaskReminder(taskId, reminder);

  const task = reminder ? await loadTask(taskId) : undefined;
  if (task?.reminder) {
    await scheduleTaskNotifications(task);
  } else {
    await cancelTaskNotifications(taskId);
  }
}

export async function backfillDatedReminders() {
  const tasks = await loadTasksWithDatedReminders();
  if (tasks.length === 0) return;

  await setNotificationChannel();

  for (const task of tasks) {
    const reminder = task.reminder;
    if (!reminder) continue;

    const scheduled = await existingTaskNotifications(task.id);
    const missing = DATED_OCCURRENCES - scheduled.length;
    if (missing <= 0) continue;

    const lastTargetDate = scheduled.at(-1)?.content.data?.targetDate;
    const lastDate =
      typeof lastTargetDate === 'string'
        ? parse(`${lastTargetDate} ${reminder.time}`, 'yyyy-MM-dd HH:mm', new Date())
        : parse(reminder.time, 'HH:mm', new Date());

    const dates = computeReminderSchedule(lastDate, reminder, missing);
    await scheduleDatedNotifications(task, reminder, dates);
  }
}
