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

export const reminders = sqliteTable(
  'reminders',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    taskId: integer('task_id')
      .references(() => tasks.id)
      .notNull(),
    time: text().notNull(),
    type: text({ enum: ['daily', 'weekly', 'monthly'] }).notNull(),
    interval: integer().notNull(),
    dayOfWeek: integer(),
    dayOfMonth: integer(),
  },
  (table) => [uniqueIndex('remindersTaskIdUniqueIndex').on(table.taskId)],
);

export function lower(name: AnySQLiteColumn) {
  return sql`lower(${name})`;
}

export const relations = defineRelations({ categories, tasks, taskLog, reminders }, (r) => ({
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
    reminder: r.one.reminders({
      from: r.tasks.id,
      to: r.reminders.taskId,
      optional: true,
    }),
  },
  taskLog: {
    task: r.one.tasks({
      from: r.taskLog.task_id,
      to: r.tasks.id,
      optional: false,
    }),
  },
  reminders: {
    task: r.one.tasks({
      from: r.reminders.taskId,
      to: r.tasks.id,
      optional: false,
    }),
  },
}));
