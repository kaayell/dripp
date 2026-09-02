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

export const trackedTask = sqliteTable('tracked_task', {
  id: integer().primaryKey({ autoIncrement: true }),
  task_id: integer('task_id')
    .references(() => tasks.id)
    .notNull(),
  date: text().notNull(),
});

export const relations = defineRelations({ categories, tasks, trackedTask }, (r) => ({
  tasks: {
    category: r.one.categories({
      from: r.tasks.categoryId,
      to: r.categories.id,
      optional: true,
    }),
    mostRecentTrackedTask: r.one.trackedTask({
      from: r.tasks.id,
      to: r.trackedTask.task_id,
      optional: true,
    }),
  },
  trackedTask: {
    task: r.one.tasks({
      from: r.trackedTask.task_id,
      to: r.tasks.id,
      optional: false,
    }),
  },
}));
