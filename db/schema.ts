import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { defineRelations } from 'drizzle-orm';

export const categories = sqliteTable('categories', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  color: text().notNull(),
  categoryId: integer('category_id').references(() => categories.id),
});

export const taskLog = sqliteTable('task_log', {
  id: integer().primaryKey({ autoIncrement: true }),
  task_id: integer('task_id')
    .references(() => tasks.id)
    .notNull(),
  date: text().notNull(),
});

export const relations = defineRelations({ categories, tasks, taskLog }, (r) => ({
  tasks: {
    category: r.one.categories({
      from: r.tasks.categoryId,
      to: r.categories.id,
      optional: true,
    }),
    mostRecentTaskLog: r.one.taskLog({
      from: r.tasks.id,
      to: r.taskLog.task_id,
      optional: true,
    }),
    taskLogs: r.many.taskLog({
      from: r.tasks.id,
      to: r.taskLog.task_id,
    }),
  },
  taskLog: {
    task: r.one.tasks({
      from: r.taskLog.task_id,
      to: r.tasks.id,
      optional: false,
    }),
  },
}));
