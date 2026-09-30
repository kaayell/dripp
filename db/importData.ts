import { db } from './client';
import { categories, reminders, taskLog, tasks } from './schema';
import { AppData } from './queries.ts';

export type ImportMode = 'replace' | 'merge';

export type ImportResult = {
  categories: number;
  tasks: number;
  logs: number;
  reminders: number;
};

const INSERT_CHUNK_SIZE = 200;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function insertChunked<T>(rows: T[], insert: (chunk: T[]) => Promise<unknown[]>) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
    inserted += (await insert(rows.slice(i, i + INSERT_CHUNK_SIZE))).length;
  }
  return inserted;
}

async function mergeInto(tx: Transaction, data: AppData): Promise<ImportResult> {
  const result: ImportResult = { categories: 0, tasks: 0, logs: 0, reminders: 0 };

  const categoryIds = new Map(
    (await tx.select().from(categories)).map((c) => [c.name.toLowerCase(), c.id]),
  );
  for (const category of data.categories) {
    if (categoryIds.has(category.name.toLowerCase())) continue;
    const [created] = await tx.insert(categories).values(category).returning();
    categoryIds.set(created.name.toLowerCase(), created.id);
    result.categories++;
  }

  const taskIds = new Map((await tx.select().from(tasks)).map((t) => [t.name.toLowerCase(), t.id]));
  for (const { category, logs, reminder, ...task } of data.tasks) {
    if (taskIds.has(task.name.toLowerCase())) continue;
    const categoryId = category == null ? null : categoryIds.get(category.toLowerCase())!;
    const [created] = await tx
      .insert(tasks)
      .values({ ...task, categoryId })
      .returning();
    taskIds.set(created.name.toLowerCase(), created.id);
    result.tasks++;
  }

  const taskId = (name: string) => taskIds.get(name.toLowerCase())!;

  result.logs = await insertChunked(
    data.tasks.flatMap((task) => task.logs.map((log) => ({ ...log, task_id: taskId(task.name) }))),
    (chunk) => tx.insert(taskLog).values(chunk).onConflictDoNothing().returning({ id: taskLog.id }),
  );

  result.reminders = await insertChunked(
    data.tasks.flatMap((task) =>
      task.reminder ? [{ ...task.reminder, taskId: taskId(task.name) }] : [],
    ),
    (chunk) =>
      tx.insert(reminders).values(chunk).onConflictDoNothing().returning({ id: reminders.id }),
  );

  return result;
}

async function replaceAll(tx: Transaction, data: AppData): Promise<ImportResult> {
  await tx.delete(reminders);
  await tx.delete(taskLog);
  await tx.delete(tasks);
  await tx.delete(categories);
  return mergeInto(tx, data);
}

export async function importAppData(data: AppData, mode: ImportMode): Promise<ImportResult> {
  return db.transaction((tx) => (mode === 'replace' ? replaceAll(tx, data) : mergeInto(tx, data)));
}
