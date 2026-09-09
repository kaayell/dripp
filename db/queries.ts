import { eq } from 'drizzle-orm';
import { db } from './client';
import { categories, tasks, taskLog } from './schema';

export type Category = typeof categories.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TaskWithDetails = Task & { category?: Category | null; taskLogs: TaskLog[] };

export type TaskLog = typeof taskLog.$inferSelect;
export type TaskLogWithTask = TaskLog & { task: Task };
export type TaskWithMostRecentLog = Task & {
  category: Category | null;
  mostRecentTaskLog: TaskLog | null;
};

export async function loadCategories(): Promise<Category[]> {
  return db.select().from(categories);
}

export async function createCategory(name: string): Promise<Category> {
  const [created] = await db.insert(categories).values({ name }).returning();
  return created;
}

export async function loadTask(taskId: number): Promise<Task | undefined> {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  return task;
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

export async function createTask(task: {
  name: string;
  color: string;
  categoryId: number | null;
}): Promise<Task> {
  const [created] = await db.insert(tasks).values(task).returning();
  return created;
}

export async function updateTask(
  taskId: number,
  task: { name: string; color: string; categoryId: number | null },
): Promise<Task> {
  const [updated] = await db.update(tasks).set(task).where(eq(tasks.id, taskId)).returning();
  return updated;
}

export async function loadTaskLogs() {
  return await db.query.taskLog.findMany({
    with: { task: true },
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
