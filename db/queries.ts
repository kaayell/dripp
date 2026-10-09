import { and, eq } from 'drizzle-orm';
import { db } from './client';
import { categories, reminders, taskLog, taskNotes, tasks, timestamps } from './schema';

export type Category = typeof categories.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskWithDetails = Task & {
  category?: Category | null;
  taskLogs: TaskLog[];
  taskNotes: TaskNote[];
  reminder?: Reminder | null;
};

export type TaskLog = typeof taskLog.$inferSelect;
export type TaskNote = typeof taskNotes.$inferSelect;
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

type Audited = Partial<Pick<Task, AuditFields>>;
export type ExportedCategory = Pick<Category, 'name'> & Audited;
export type ExportedTaskLog = Pick<TaskLog, 'date'> & Audited;
export type ExportedTaskNote = Pick<TaskNote, 'date' | 'note'> & Audited;
export type ExportedReminder = Omit<Reminder, 'id' | 'taskId' | AuditFields> & Audited;
export type ExportedTask = Pick<Task, 'name' | 'color'> &
  Audited & {
    category: string | null;
    logs: ExportedTaskLog[];
    notes?: ExportedTaskNote[];
    reminder: ExportedReminder | null;
  };

export type AppData = {
  categories: ExportedCategory[];
  tasks: ExportedTask[];
};

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
    with: {
      taskLogs: { orderBy: { date: 'desc' } },
      taskNotes: { orderBy: { date: 'desc' } },
      category: true,
      reminder: true,
    },
  });
}

export async function loadTasksWithReminders(): Promise<TaskWithReminder[]> {
  return await db.query.tasks.findMany({
    where: { reminder: true },
    with: { reminder: true },
  });
}

export async function loadTasksWithDatedReminders(): Promise<TaskWithReminder[]> {
  return await db.query.tasks.findMany({
    where: { reminder: { interval: { gt: 1 } } },
    with: { reminder: true },
  });
}

export async function loadTasks(): Promise<Task[]> {
  return await db.query.tasks.findMany({
    orderBy: (t, { sql }) => sql`${t.categoryId} asc nulls last`,
  });
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

export async function loadTaskReminder(taskId: number): Promise<Reminder | undefined> {
  return await db.query.reminders.findFirst({
    where: { taskId },
  });
}

export async function setTaskReminder(
  taskId: number,
  reminder: ReminderInputValues | null,
): Promise<Reminder | undefined> {
  if (reminder) {
    const [updated] = await db
      .insert(reminders)
      .values({ taskId, ...reminder })
      .onConflictDoUpdate({ target: reminders.taskId, set: { ...reminder } })
      .returning();
    return updated;
  }
  await db.delete(reminders).where(eq(reminders.taskId, taskId));
}

export async function loadTaskLogs() {
  return await db.query.taskLog.findMany({
    with: { task: true },
    orderBy: { task_id: 'asc' },
  });
}

export async function loadTaskLog(taskId: number, date: string): Promise<TaskLog | undefined> {
  return await db.query.taskLog.findFirst({
    where: { task_id: taskId, date },
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

export async function loadTaskNote(taskId: number, date: string): Promise<TaskNote | undefined> {
  return await db.query.taskNotes.findFirst({
    where: { task_id: taskId, date },
  });
}

export async function saveTaskNote(taskId: number, date: string, note: string) {
  if (!note) {
    await db.delete(taskNotes).where(and(eq(taskNotes.task_id, taskId), eq(taskNotes.date, date)));
    return;
  }
  await db
    .insert(taskNotes)
    .values({ task_id: taskId, date, note })
    .onConflictDoUpdate({ target: [taskNotes.task_id, taskNotes.date], set: { note } });
}

export async function exportAppData(): Promise<AppData> {
  const audited = { createdAt: true, updatedAt: true } as const;
  const [allCategories, allTasks] = await Promise.all([
    db.query.categories.findMany({
      columns: { name: true, ...audited },
      orderBy: { id: 'asc' },
    }),
    db.query.tasks.findMany({
      columns: { name: true, color: true, ...audited },
      with: {
        category: { columns: { name: true } },
        taskLogs: { columns: { date: true, ...audited }, orderBy: { date: 'asc' } },
        taskNotes: { columns: { date: true, note: true, ...audited }, orderBy: { date: 'asc' } },
        reminder: { columns: { id: false, taskId: false } },
      },
      orderBy: { id: 'asc' },
    }),
  ]);

  return {
    categories: allCategories,
    tasks: allTasks.map(({ category, taskLogs, taskNotes, reminder, ...task }) => ({
      ...task,
      category: category?.name ?? null,
      logs: taskLogs,
      notes: taskNotes,
      reminder: reminder ?? null,
    })),
  };
}
