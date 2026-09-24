import { eq } from 'drizzle-orm';
import { db } from './client';
import { categories, tasks, taskLog, reminders, timestamps } from './schema';

export type Category = typeof categories.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskWithDetails = Task & { category?: Category | null; taskLogs: TaskLog[] };

export type TaskLog = typeof taskLog.$inferSelect;
export type TaskLogWithTask = TaskLog & { task: Task };
export type TaskWithMostRecentLog = Task & {
  category: Category | null;
  mostRecentTaskLog: TaskLog | null;
};

export type Reminder = typeof reminders.$inferSelect;
export type TaskWithReminder = Task & { reminder: Reminder | null };

type AuditFields = keyof typeof timestamps;

export type ReminderInputValues = Omit<Reminder, 'id' | 'taskId' | AuditFields>;

export type TaskInputValues = Omit<Task, 'id' | AuditFields>;

export async function loadCategories(): Promise<Category[]> {
  return db.select().from(categories);
}

export async function createCategory(name: string): Promise<Category> {
  const [created] = await db.insert(categories).values({ name }).returning();
  return created;
}

export async function loadTask(taskId: number): Promise<TaskWithReminder | undefined> {
  return await db.query.tasks.findFirst({
    where: { id: taskId },
    with: { reminder: true },
  });
}

export async function loadTaskWithDetails(taskId: number): Promise<TaskWithDetails | undefined> {
  return await db.query.tasks.findFirst({
    where: { id: taskId },
    with: { taskLogs: { orderBy: { date: 'desc' } }, category: true },
  });
}

export async function loadTasks(): Promise<Task[]> {
  return db.select().from(tasks);
}

export async function loadTasksWithMostRecentLog(): Promise<TaskWithMostRecentLog[]> {
  return await db.query.tasks.findMany({
    with: {
      category: true,
      mostRecentTaskLog: {
        orderBy: { date: 'desc' },
      },
    },
  });
}

export async function createTask(task: TaskInputValues): Promise<Task> {
  const [created] = await db.insert(tasks).values(task).returning();
  return created;
}

export async function updateTask(taskId: number, task: TaskInputValues): Promise<Task> {
  const [updated] = await db.update(tasks).set(task).where(eq(tasks.id, taskId)).returning();
  return updated;
}

export async function setTaskReminder(
  taskId: number,
  reminder: ReminderInputValues | null,
): Promise<void> {
  if (reminder) {
    await db
      .insert(reminders)
      .values({ taskId, ...reminder })
      .onConflictDoUpdate({ target: reminders.taskId, set: reminder });
    return;
  }
  await db.delete(reminders).where(eq(reminders.taskId, taskId));
}

export async function loadTaskLogs() {
  return await db.query.taskLog.findMany({
    with: { task: true },
    orderBy: { task_id: 'asc' },
  });
}

export async function loadTaskLogsForDay(date: string): Promise<TaskLog[]> {
  return await db.select().from(taskLog).where(eq(taskLog.date, date));
}

export async function createTaskLog(taskId: number, date: string): Promise<TaskLog> {
  const [created] = await db.insert(taskLog).values({ task_id: taskId, date: date }).returning();
  return created;
}

export async function removeTaskLog(taskLogId: number) {
  await db.delete(taskLog).where(eq(taskLog.id, taskLogId));
}

export async function toggleTaskLog(taskId: number, date: string): Promise<TaskLog | undefined> {
  const existing = await db.query.taskLog.findFirst({
    where: { task_id: taskId, date },
  });

  if (existing) {
    await removeTaskLog(existing.id);
    return;
  }
  return await createTaskLog(taskId, date);
}
