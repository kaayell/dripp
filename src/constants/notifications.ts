export const TASK_REMINDER_CATEGORY = 'task-reminder';
export const TASK_COMPLETED_ACTION = 'task-completed';
export const REMINDER_CHANNEL = 'dripp-reminders';

export const reminderIdentifier = (taskId: number, date?: string) =>
  date ? `${TASK_REMINDER_CATEGORY}-${taskId}-${date}` : `${TASK_REMINDER_CATEGORY}-${taskId}`;
