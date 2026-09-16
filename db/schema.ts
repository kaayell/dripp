import {
  AnySQLiteColumn,
  integer,
  sqliteTable,
  text,
  unique,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { defineRelations, sql } from 'drizzle-orm';

export const categories = sqliteTable(
  'categories',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
  },
  (table) => [uniqueIndex('categoriesNameUniqueIndex').on(lower(table.name))],
);

export const tasks = sqliteTable(
  'tasks',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    color: text().notNull(),
    categoryId: integer('category_id').references(() => categories.id),
  },
  (table) => [uniqueIndex('tasksNameUniqueIndex').on(lower(table.name))],
);

export const taskLog = sqliteTable(
  'task_log',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    task_id: integer('task_id')
      .references(() => tasks.id)
      .notNull(),
    date: text().notNull(),
  },
  (table) => [unique().on(table.task_id, table.date)],
);

export function lower(name: AnySQLiteColumn) {
  return sql`lower(${name})`;
}

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
