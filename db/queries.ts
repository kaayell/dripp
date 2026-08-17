import { and, eq } from 'drizzle-orm';
import { db } from './client';
import { categories, tasks, trackedTask } from './schema';

export type Category = typeof categories.$inferSelect;
export type Task = typeof tasks.$inferSelect;

export type TrackedDates = Record<number, Set<string>>;

export async function loadCategories(): Promise<Category[]> {
  return db.select().from(categories);
}

export async function loadTasks(): Promise<Task[]> {
  return db.select().from(tasks);
}

export async function loadTrackedDates(): Promise<TrackedDates> {
  const rows = await db.select().from(trackedTask);
  const data: TrackedDates = {};
  for (const row of rows) {
    if (row.task_id == null) continue;
    if (!data[row.task_id]) data[row.task_id] = new Set();
    data[row.task_id].add(row.date);
  }
  return data;
}

export async function setTrackedDate(
  taskId: number,
  date: string,
  marked: boolean
): Promise<void> {
  if (marked) {
    const [existing] = await db
      .select()
      .from(trackedTask)
      .where(and(eq(trackedTask.task_id, taskId), eq(trackedTask.date, date)))
      .limit(1);
    if (!existing) {
      await db.insert(trackedTask).values({ task_id: taskId, date });
    }
  } else {
    await db
      .delete(trackedTask)
      .where(and(eq(trackedTask.task_id, taskId), eq(trackedTask.date, date)));
  }
}
