jest.mock('../client', () => require('./__fixtures__/client'));

import { eq } from 'drizzle-orm';
import { db } from '../client';
import {
  createCategory,
  createTask,
  createTaskLog,
  loadCategories,
  loadTask,
  loadTaskLogs,
  loadTaskLogsForDay,
  loadTaskNote,
  loadTaskReminder,
  loadTasks,
  loadTasksWithDatedReminders,
  loadTasksWithCategory,
  loadTasksWithMostRecentLog,
  loadTaskWithDetails,
  removeTaskLog,
  saveTaskNote,
  setTaskReminder,
  exportAppData,
  toggleTaskLog,
  updateTask,
  loadTasksWithReminders,
} from '../queries';
import { categories, reminders, taskLog, taskNotes, tasks } from '../schema';

afterEach(async () => {
  await db.delete(reminders);
  await db.delete(taskLog);
  await db.delete(taskNotes);
  await db.delete(tasks);
  await db.delete(categories);
});

describe('loadCategories', () => {
  it('returns empty array when no categories exist', async () => {
    expect(await loadCategories()).toEqual([]);
  });

  it('returns all categories', async () => {
    await db.insert(categories).values([{ name: 'bod' }, { name: 'hoose' }]);

    const result = await loadCategories();

    expect(result.map((c) => c.name).sort()).toEqual(['bod', 'hoose']);
  });
});

describe('createCategory', () => {
  it('inserts and returns the created category', async () => {
    const created = await createCategory('bod');

    expect(created).toMatchObject({ name: 'bod' });
    expect(created.id).toEqual(expect.any(Number));
    expect(await loadCategories()).toHaveLength(1);
  });
});

describe('loadTask', () => {
  it('returns empty array when no tasks exist', async () => {
    expect(await loadTask(12)).toEqual(undefined);
  });

  it('returns task for id', async () => {
    const [task] = await db
      .insert(tasks)
      .values([{ name: 'drip', color: '#ffffff', categoryId: null }])
      .returning();

    const result = await loadTask(task.id);
    expect(result).toMatchObject(task);
  });
});

describe('loadTaskWithDetails', () => {
  it('returns empty array when no task exist', async () => {
    expect(await loadTaskWithDetails(12)).toEqual(undefined);
  });

  it('returns task with sorted task logs', async () => {
    const [task] = await db
      .insert(tasks)
      .values([{ name: 'drip', color: '#ffffff', categoryId: null }])
      .returning();

    const [logOne, logTwo] = await db
      .insert(taskLog)
      .values([
        { task_id: task.id, date: '2026-01-01' },
        { task_id: task.id, date: '2026-01-02' },
      ])
      .returning();

    const result = await loadTaskWithDetails(task.id);
    expect(result?.taskLogs).toEqual([logTwo, logOne]);
  });

  it('returns task with sorted task notes', async () => {
    const [task] = await db
      .insert(tasks)
      .values([{ name: 'drip', color: '#ffffff', categoryId: null }])
      .returning();

    const [noteOne, noteTwo] = await db
      .insert(taskNotes)
      .values([
        { task_id: task.id, date: '2026-01-01', note: 'lalala' },
        { task_id: task.id, date: '2026-01-02', note: 'hihi' },
      ])
      .returning();

    const result = await loadTaskWithDetails(task.id);
    expect(result?.taskNotes).toEqual([noteTwo, noteOne]);
  });

  it('returns task with category', async () => {
    const [category] = await db
      .insert(categories)
      .values([{ name: 'bod' }])
      .returning();

    const [task] = await db
      .insert(tasks)
      .values([{ name: 'drip', color: '#ffffff', categoryId: category.id }])
      .returning();

    const result = await loadTaskWithDetails(task.id);
    expect(result?.category).toEqual(category);
  });
});

describe('loadTasks', () => {
  it('returns empty array when no tasks exist', async () => {
    expect(await loadTasks()).toEqual([]);
  });

  it('returns all tasks', async () => {
    await db.insert(tasks).values([{ name: 'drip', color: '#ffffff', categoryId: null }]);

    const result = await loadTasks();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('drip');
  });

  it('returns all tasks ordered by categories', async () => {
    const [bod, home] = await db
      .insert(categories)
      .values([{ name: 'bod' }, { name: 'home' }])
      .returning();
    const [mop, drip, party, walk] = await db
      .insert(tasks)
      .values([
        { name: 'mop', color: '#64a1ee', categoryId: home.id },
        { name: 'drip', color: '#ffffff', categoryId: bod.id },
        { name: 'party', color: '#000000', categoryId: null },
        { name: 'walk', color: '#e18b60', categoryId: bod.id },
      ])
      .returning();

    const result = await loadTasks();
    expect(result).toEqual([drip, walk, mop, party]);
  });
});

describe('loadTasksWithCategory', () => {
  it('returns empty array when no tasks exist', async () => {
    expect(await loadTasksWithCategory()).toEqual([]);
  });

  it('returns tasks with their category, ordered by category with uncategorized last', async () => {
    const [bod, home] = await db
      .insert(categories)
      .values([{ name: 'bod' }, { name: 'home' }])
      .returning();
    const [mop, drip, party, walk] = await db
      .insert(tasks)
      .values([
        { name: 'mop', color: '#64a1ee', categoryId: home.id },
        { name: 'drip', color: '#ffffff', categoryId: bod.id },
        { name: 'party', color: '#000000', categoryId: null },
        { name: 'walk', color: '#e18b60', categoryId: bod.id },
      ])
      .returning();

    const result = await loadTasksWithCategory();
    expect(result).toEqual([
      { ...drip, category: bod },
      { ...walk, category: bod },
      { ...mop, category: home },
      { ...party, category: null },
    ]);
  });
});

describe('loadTasksWithMostRecentLog', () => {
  it('returns empty array when no tasks exist', async () => {
    expect(await loadTasksWithMostRecentLog()).toEqual([]);
  });

  it('returns all tasks with category', async () => {
    const [category] = await db
      .insert(categories)
      .values([{ name: 'bod' }])
      .returning();

    await db.insert(tasks).values([
      { name: 'mop', color: '#000000', categoryId: null },
      { name: 'drip', color: '#ffffff', categoryId: category.id },
    ]);

    const result = await loadTasksWithMostRecentLog();
    expect(result).toHaveLength(2);
    expect(result[0].category).toBe(null);
    expect(result[1].category).toEqual(category);
  });

  it('includes each task with its most recent task log', async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    await db.insert(tasks).values({ name: 'mop', color: '#000000', categoryId: null });

    await db.insert(taskLog).values([
      { task_id: dripTask.id, date: '2026-01-01' },
      { task_id: dripTask.id, date: '2026-01-03' },
      { task_id: dripTask.id, date: '2026-01-02' },
    ]);

    const result = await loadTasksWithMostRecentLog();
    expect(result).toHaveLength(2);
    expect(result[0].mostRecentTaskLog).toMatchObject({
      task_id: dripTask.id,
      date: '2026-01-03',
    });
    expect(result[1].mostRecentTaskLog).toBe(null);
  });
});

describe('createTask', () => {
  it('inserts and returns the created task', async () => {
    const created = await createTask({ name: 'clean', color: '#000000', categoryId: null });

    expect(created).toMatchObject({ name: 'clean', color: '#000000', categoryId: null });
    expect(created.id).toEqual(expect.any(Number));
    expect(await loadTasks()).toHaveLength(1);
  });

  it('associates the task with a category', async () => {
    const [category] = await db.insert(categories).values({ name: 'home' }).returning();

    const created = await createTask({ name: 'mop', color: '#000000', categoryId: category.id });

    expect(created.categoryId).toBe(category.id);
  });
});

describe('updateTask', () => {
  it('updates and returns the task', async () => {
    const [category] = await db
      .insert(categories)
      .values([{ name: 'house' }])
      .returning();
    const [task] = await db
      .insert(tasks)
      .values([{ name: 'drip', color: '#ffffff', categoryId: null }])
      .returning();

    const updated = await updateTask(task.id, {
      name: 'mop',
      color: '#000000',
      categoryId: category.id,
    });

    expect(updated).toMatchObject({ name: 'mop', color: '#000000', categoryId: category.id });
    expect(updated.id).toEqual(task.id);
    expect(await loadTasks()).toHaveLength(1);
  });
});

describe('loadTaskReminder', () => {
  let dripTaskId: number;

  beforeEach(async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();
    dripTaskId = dripTask.id;
  });

  it('returns undefined when no reminder exists', async () => {
    expect(await loadTaskReminder(12)).toEqual(undefined);
  });

  it('returns task for id', async () => {
    const [reminder] = await db
      .insert(reminders)
      .values([
        {
          taskId: dripTaskId,
          time: '09:00',
          type: 'daily',
          interval: 1,
          dayOfWeek: null,
          dayOfMonth: null,
        },
      ])
      .returning();

    const result = await loadTaskReminder(dripTaskId);
    expect(result).toMatchObject(reminder);
  });
});

describe('loadTasksWithReminders', () => {
  it('returns only tasks that have a reminder', async () => {
    const [dripTask, mopTask] = await db
      .insert(tasks)
      .values([
        { name: 'drip', color: '#ffffff', categoryId: null },
        { name: 'mop', color: '#000000', categoryId: null },
        { name: 'sweep', color: '#000000', categoryId: null },
      ])
      .returning();

    const [dripReminder, mopReminder] = await db
      .insert(reminders)
      .values([
        {
          taskId: dripTask.id,
          time: '09:00',
          type: 'daily',
          interval: 1,
          dayOfWeek: null,
          dayOfMonth: null,
        },
        {
          taskId: mopTask.id,
          time: '09:00',
          type: 'weekly',
          interval: 1,
          dayOfWeek: 2,
          dayOfMonth: null,
        },
      ])
      .returning();

    const result = await loadTasksWithReminders();
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ ...dripTask, reminder: dripReminder });
    expect(result[1]).toMatchObject({ ...mopTask, reminder: mopReminder });
  });
});

describe('loadTasksWithDatedReminders', () => {
  it('returns empty array when no tasks exist', async () => {
    expect(await loadTasksWithDatedReminders()).toEqual([]);
  });

  it('returns only tasks with a reminder interval above 1', async () => {
    const [dripTask, mopTask] = await db
      .insert(tasks)
      .values([
        { name: 'drip', color: '#ffffff', categoryId: null },
        { name: 'mop', color: '#000000', categoryId: null },
        { name: 'sweep', color: '#000000', categoryId: null },
      ])
      .returning();

    const [datedReminder] = await db
      .insert(reminders)
      .values([
        {
          taskId: dripTask.id,
          time: '09:00',
          type: 'weekly',
          interval: 2,
          dayOfWeek: 1,
          dayOfMonth: null,
        },
        {
          taskId: mopTask.id,
          time: '09:00',
          type: 'daily',
          interval: 1,
          dayOfWeek: null,
          dayOfMonth: null,
        },
      ])
      .returning();

    const result = await loadTasksWithDatedReminders();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ ...dripTask, reminder: datedReminder });
  });
});

describe('setTaskReminder', () => {
  let dripTaskId: number;

  beforeEach(async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();
    dripTaskId = dripTask.id;
  });

  it('creates a reminder when none exists', async () => {
    const reminder = await setTaskReminder(dripTaskId, {
      time: '09:00',
      type: 'daily',
      interval: 1,
      dayOfWeek: null,
      dayOfMonth: null,
    });

    const result = await db.select().from(reminders).where(eq(reminders.taskId, dripTaskId));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(reminder);
  });

  it('updates the existing reminder instead of creating a second one', async () => {
    await setTaskReminder(dripTaskId, {
      time: '09:00',
      type: 'daily',
      interval: 1,
      dayOfWeek: null,
      dayOfMonth: null,
    });

    let reminder = await setTaskReminder(dripTaskId, {
      time: '18:30',
      type: 'weekly',
      interval: 2,
      dayOfWeek: 1,
      dayOfMonth: null,
    });

    const result = await db.select().from(reminders).where(eq(reminders.taskId, dripTaskId));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(reminder);
  });

  it('deletes the reminder when passed null', async () => {
    const reminder = await setTaskReminder(dripTaskId, {
      time: '09:00',
      type: 'daily',
      interval: 1,
      dayOfWeek: null,
      dayOfMonth: null,
    });
    expect(reminder).toBeDefined();

    const removedReminder = await setTaskReminder(dripTaskId, null);
    const result = await db.select().from(reminders).where(eq(reminders.taskId, dripTaskId));
    expect(removedReminder).toBeUndefined();
    expect(result).toEqual([]);
  });

  it('does nothing when passed null and no reminder exists', async () => {
    const reminder = await setTaskReminder(dripTaskId, null);
    const result = await db.select().from(reminders).where(eq(reminders.taskId, dripTaskId));
    expect(reminder).toBeUndefined();
    expect(result).toEqual([]);
  });
});

describe('loadTaskLogs', () => {
  it('returns empty object when no tracked dates exist', async () => {
    expect(await loadTaskLogs()).toEqual([]);
  });

  it('loads all task logs', async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    const [logOne, logTwo] = await db
      .insert(taskLog)
      .values([
        { task_id: dripTask.id, date: '2026-01-01' },
        { task_id: dripTask.id, date: '2026-01-02' },
      ])
      .returning();

    const result = await loadTaskLogs();
    expect(result).toHaveLength(2);
    expect([...result]).toEqual([
      { ...logOne, task: dripTask },
      { ...logTwo, task: dripTask },
    ]);
  });
});

describe('loadTaskLogsForDay', () => {
  it('returns empty object when no tracked dates exist', async () => {
    expect(await loadTaskLogsForDay('2026-01-01')).toEqual([]);
  });

  it('loads all task logs using date', async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    let date = '2026-01-01';
    await db.insert(taskLog).values([
      { task_id: dripTask.id, date: date },
      { task_id: dripTask.id, date: '2026-01-02' },
    ]);

    const result = await loadTaskLogsForDay(date);
    expect(result).toHaveLength(1);
    expect(result[0].date).toEqual(date);
    expect(result[0].task_id).toEqual(dripTask.id);
  });
});

describe('createTaskLog', () => {
  it('inserts and returns the created task log', async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    const created = await createTaskLog(dripTask.id, '2026-01-01');
    expect(created).toMatchObject({ task_id: dripTask.id, date: '2026-01-01' });
    expect(created.id).toEqual(expect.any(Number));
    expect(await loadTaskLogs()).toHaveLength(1);
  });
});

describe('removeTaskLog', () => {
  it('removes task log', async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    const [createdTaskLog] = await db
      .insert(taskLog)
      .values([{ task_id: dripTask.id, date: '2026-01-01' }])
      .returning();

    await removeTaskLog(createdTaskLog.id);

    expect(await loadTaskLogs()).toHaveLength(0);
  });
});

describe('toggleTaskLog', () => {
  let dripTaskId: number;

  beforeEach(async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();
    dripTaskId = dripTask.id;
  });

  it('creates task log when none exists', async () => {
    const result = await toggleTaskLog(dripTaskId, '2026-01-01');
    expect(result).toMatchObject({ task_id: dripTaskId, date: '2026-01-01' });
    expect(await loadTaskLogs()).toHaveLength(1);
  });

  it('removes existing task log', async () => {
    await db.insert(taskLog).values([{ task_id: dripTaskId, date: '2026-01-01' }]);

    const result = await toggleTaskLog(dripTaskId, '2026-01-01');
    expect(result).toBeUndefined();
    expect(await loadTaskLogs()).toHaveLength(0);
  });
});

describe('loadTaskNote', () => {
  let dripTaskId: number;
  let mopTaskId: number;

  beforeEach(async () => {
    const [drip, mop] = await db
      .insert(tasks)
      .values([
        { name: 'drip', color: '#ffffff' },
        { name: 'mop', color: '#000000' },
      ])
      .returning();
    dripTaskId = drip.id;
    mopTaskId = mop.id;
  });

  it('returns undefined when the day has no note', async () => {
    expect(await loadTaskNote(dripTaskId, '2026-01-01')).toBeUndefined();
  });

  it('returns the note for that task and day only', async () => {
    await db.insert(taskNotes).values([
      { task_id: dripTaskId, date: '2026-01-01', note: 'drip note' },
      { task_id: dripTaskId, date: '2026-01-02', note: 'next day' },
      { task_id: mopTaskId, date: '2026-01-01', note: 'mop note' },
    ]);

    const result = await loadTaskNote(dripTaskId, '2026-01-01');

    expect(result).toMatchObject({ task_id: dripTaskId, date: '2026-01-01', note: 'drip note' });
  });
});

describe('saveTaskNote', () => {
  let dripTaskId: number;

  const storedNotes = () =>
    db.select({ date: taskNotes.date, note: taskNotes.note }).from(taskNotes);

  beforeEach(async () => {
    const [drip] = await db.insert(tasks).values({ name: 'drip', color: '#ffffff' }).returning();
    dripTaskId = drip.id;
  });

  it('creates a note when none exists', async () => {
    await saveTaskNote(dripTaskId, '2026-01-01', 'rained');

    expect(await storedNotes()).toEqual([{ date: '2026-01-01', note: 'rained' }]);
  });

  it('updates the existing note for the same day', async () => {
    await saveTaskNote(dripTaskId, '2026-01-01', 'rained');
    await saveTaskNote(dripTaskId, '2026-01-01', 'rained a lot');

    expect(await storedNotes()).toEqual([{ date: '2026-01-01', note: 'rained a lot' }]);
  });

  it('deletes the note when saved empty', async () => {
    await db.insert(taskNotes).values([
      { task_id: dripTaskId, date: '2026-01-01', note: 'rained' },
      { task_id: dripTaskId, date: '2026-01-02', note: 'sunny' },
    ]);

    await saveTaskNote(dripTaskId, '2026-01-01', '');

    expect(await storedNotes()).toEqual([{ date: '2026-01-02', note: 'sunny' }]);
  });
});

describe('exportAppData', () => {
  beforeEach(async () => {
    const [bod, home] = await db
      .insert(categories)
      .values([{ name: 'bod' }, { name: 'home' }])
      .returning();
    const [walk, mop] = await db
      .insert(tasks)
      .values([
        { name: 'walk', color: '#e18b60', categoryId: bod.id },
        { name: 'mop', color: '#64a1ee', categoryId: home.id },
      ])
      .returning();
    await db.insert(taskLog).values([
      { task_id: walk.id, date: '2026-09-01' },
      { task_id: walk.id, date: '2026-09-03' },
      { task_id: mop.id, date: '2026-09-02' },
    ]);
    await db.insert(taskNotes).values({ task_id: walk.id, date: '2026-09-02', note: 'rained' });
    await db
      .insert(reminders)
      .values({ taskId: mop.id, time: '09:00', type: 'weekly', interval: 1, dayOfWeek: 2 });
  });

  it('exports categories and tasks without database ids', async () => {
    const audit = { createdAt: expect.any(String), updatedAt: expect.any(String) };

    const data = await exportAppData();

    expect(data).toEqual({
      categories: [
        { name: 'bod', ...audit },
        { name: 'home', ...audit },
      ],
      tasks: [
        {
          name: 'walk',
          color: '#e18b60',
          category: 'bod',
          logs: [
            { date: '2026-09-01', ...audit },
            { date: '2026-09-03', ...audit },
          ],
          notes: [{ date: '2026-09-02', note: 'rained', ...audit }],
          reminder: null,
          ...audit,
        },
        {
          name: 'mop',
          color: '#64a1ee',
          category: 'home',
          logs: [{ date: '2026-09-02', ...audit }],
          notes: [],
          reminder: {
            time: '09:00',
            type: 'weekly',
            interval: 1,
            dayOfWeek: 2,
            dayOfMonth: null,
            ...audit,
          },
          ...audit,
        },
      ],
    });
  });

  it('exports a task without a category as null', async () => {
    await db.insert(tasks).values({ name: 'nap', color: '#daa932' });

    const data = await exportAppData();

    expect(data.tasks.find((t) => t.name === 'nap')).toMatchObject({
      category: null,
      logs: [],
      notes: [],
      reminder: null,
    });
  });
});
