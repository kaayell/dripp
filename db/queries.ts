import { eq } from 'drizzle-orm';
import { db } from './client';
import { categories, tasks, trackedTask } from './schema';

export type Category = typeof categories.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TrackedTask = typeof trackedTask.$inferSelect;
export type TrackedTasks = TrackedTask & { task: Task };
export type TaskHistory = Task & {
  category: Category | null;
  mostRecentTrackedTask: TrackedTask | null;
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

export async function loadTasks(): Promise<Task[]> {
  return db.select().from(tasks);
}

export async function loadTasksWithHistory(): Promise<TaskHistory[]> {
  return await db.query.tasks.findMany({
    with: {
      category: true,
      mostRecentTrackedTask: {
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

export async function loadTrackedTasks() {
  return await db.query.trackedTask.findMany({
    with: { task: true },
  });
}

export async function loadTrackedTasksForDay(date: string): Promise<TrackedTask[]> {
  return await db.select().from(trackedTask).where(eq(trackedTask.date, date));
}

export async function createTrackedTask(taskId: number, date: string): Promise<TrackedTask> {
  const [created] = await db
    .insert(trackedTask)
    .values({ task_id: taskId, date: date })
    .returning();
  return created;
}

export async function removeTrackedTask(trackedTaskId: number) {
  await db.delete(trackedTask).where(eq(trackedTask.id, trackedTaskId));
}
