import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
