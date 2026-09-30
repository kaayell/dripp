jest.mock('../client', () => require('./__fixtures__/client'));

import { db } from '../client';
import { importAppData } from '../importData';
import type { AppData } from '../queries';
import { categories, reminders, taskLog, tasks } from '../schema';

async function clearAll() {
  await db.delete(reminders);
  await db.delete(taskLog);
  await db.delete(tasks);
  await db.delete(categories);
}

afterEach(clearAll);

const audit = { createdAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-02T10:00:00.000Z' };

const file: AppData = {
  categories: [
    { name: 'cats', ...audit },
    { name: 'garden', ...audit },
  ],
  tasks: [
    {
      name: 'feed',
      color: '#daa932',
      category: 'cats',
      logs: [
        { date: '2026-08-10', ...audit },
        { date: '2026-08-12', ...audit },
      ],
      reminder: null,
      ...audit,
    },
    {
      name: 'water',
      color: '#60e165',
      category: 'garden',
      logs: [{ date: '2026-08-11', ...audit }],
      reminder: {
        time: '18:30',
        type: 'monthly',
        interval: 1,
        dayOfWeek: null,
        dayOfMonth: 15,
        ...audit,
      },
      ...audit,
    },
  ],
};

async function storedTasks() {
  const rows = await db.query.tasks.findMany({
    with: { category: true, taskLogs: { orderBy: { date: 'asc' } }, reminder: true },
    orderBy: { id: 'asc' },
  });
  return rows.map((task) => ({
    name: task.name,
    color: task.color,
    category: task.category?.name ?? null,
    dates: task.taskLogs.map((log) => log.date),
    reminder: task.reminder?.type ?? null,
  }));
}

describe('importAppData replace', () => {
  it('replaces everything with the file contents', async () => {
    await db.insert(tasks).values({ name: 'leftover', color: '#000000' });

    const result = await importAppData(file, 'replace');

    expect(result).toEqual({ categories: 2, tasks: 2, logs: 3, reminders: 1 });
    expect(await storedTasks()).toEqual([
      {
        name: 'feed',
        color: '#daa932',
        category: 'cats',
        dates: ['2026-08-10', '2026-08-12'],
        reminder: null,
      },
      {
        name: 'water',
        color: '#60e165',
        category: 'garden',
        dates: ['2026-08-11'],
        reminder: 'monthly',
      },
    ]);
  });

  it('keeps the timestamps from the file', async () => {
    await importAppData(file, 'replace');

    for (const table of [categories, tasks, taskLog, reminders]) {
      const rows = await db
        .select({ createdAt: table.createdAt, updatedAt: table.updatedAt })
        .from(table);
      expect(rows).toEqual(rows.map(() => audit));
    }
  });
});

describe('importAppData merge', () => {
  it('adds new rows and matches existing categories and tasks by name', async () => {
    const [cats] = await db.insert(categories).values({ name: 'CATS' }).returning();
    const [feed] = await db
      .insert(tasks)
      .values({ name: 'Feed', color: '#ffffff', categoryId: cats.id })
      .returning();
    await db.insert(taskLog).values({ task_id: feed.id, date: '2026-08-10' });

    const result = await importAppData(file, 'merge');

    expect(result).toEqual({ categories: 1, tasks: 1, logs: 2, reminders: 1 });
    expect(await storedTasks()).toEqual([
      {
        name: 'Feed',
        color: '#ffffff',
        category: 'CATS',
        dates: ['2026-08-10', '2026-08-12'],
        reminder: null,
      },
      {
        name: 'water',
        color: '#60e165',
        category: 'garden',
        dates: ['2026-08-11'],
        reminder: 'monthly',
      },
    ]);
  });

  it('is idempotent', async () => {
    await importAppData(file, 'merge');

    const result = await importAppData(file, 'merge');

    expect(result).toEqual({ categories: 0, tasks: 0, logs: 0, reminders: 0 });
  });

  it('folds tasks whose names differ only by case into one', async () => {
    const task = { color: '#e18b60', category: null, reminder: null, ...audit };

    const result = await importAppData(
      {
        categories: [],
        tasks: [
          { ...task, name: 'walk', logs: [{ date: '2026-09-01', ...audit }] },
          { ...task, name: 'Walk', logs: [{ date: '2026-09-02', ...audit }] },
        ],
      },
      'merge',
    );

    expect(result).toEqual({ categories: 0, tasks: 1, logs: 2, reminders: 0 });
    expect((await storedTasks()).map((t) => [t.name, t.dates])).toEqual([
      ['walk', ['2026-09-01', '2026-09-02']],
    ]);
  });
});

describe('importAppData audit timestamps', () => {
  it('lets the database fill in timestamps the file leaves out', async () => {
    const supplied = '2020-01-01T00:00:00.000Z';
    const before = new Date().toISOString();

    await importAppData(
      {
        categories: [{ name: 'bod' }],
        tasks: [
          {
            name: 'walk',
            color: '#e18b60',
            category: 'bod',
            logs: [
              { date: '2026-09-01', createdAt: supplied, updatedAt: supplied },
              { date: '2026-09-02' },
            ],
            reminder: {
              time: '09:00',
              type: 'daily',
              interval: 1,
              dayOfWeek: null,
              dayOfMonth: null,
            },
          },
        ],
      },
      'replace',
    );

    const task = await db.query.tasks.findFirst({
      with: { category: true, taskLogs: { orderBy: { date: 'asc' } }, reminder: true },
    });
    const [suppliedLog, defaultedLog] = task!.taskLogs;
    expect(suppliedLog).toMatchObject({ createdAt: supplied, updatedAt: supplied });
    for (const row of [task!, task!.category!, defaultedLog, task!.reminder!]) {
      expect(row.createdAt >= before).toBe(true);
      expect(row.updatedAt >= before).toBe(true);
    }
  });
});
