jest.mock('../client', () => require('./__fixtures__/client'));

import { db } from '../client';
import {
  createTask,
  createTrackedTask,
  loadCategories,
  loadTasksWithHistory,
  loadTasks,
  loadTrackedTasks,
  loadTrackedTasksForDay,
  removeTrackedTask,
} from '../queries';
import { categories, tasks, trackedTask } from '../schema';

afterEach(async () => {
  await db.delete(trackedTask);
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
});

describe('loadTasksWithHistory', () => {
  it('returns empty array when no tasks exist', async () => {
    expect(await loadTasksWithHistory()).toEqual([]);
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

    const result = await loadTasksWithHistory();
    expect(result).toHaveLength(2);
    expect(result[0].category).toBe(null);
    expect(result[1].category).toEqual({ id: category.id, name: category.name });
  });

  it('includes each task with its most recent tracked task', async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    await db.insert(trackedTask).values([
      { task_id: dripTask.id, date: '2026-01-01' },
      { task_id: dripTask.id, date: '2026-01-03' },
      { task_id: dripTask.id, date: '2026-01-02' },
    ]);

    const [mopTask] = await db
      .insert(tasks)
      .values({ name: 'mop', color: '#000000', categoryId: null })
      .returning();

    const result = await loadTasksWithHistory();
    expect(result).toHaveLength(2);
    expect(result[0].mostRecentTrackedTask).toMatchObject({
      task_id: dripTask.id,
      date: '2026-01-03',
    });
    expect(result[1].mostRecentTrackedTask).toBe(null);
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

describe('loadTrackedTasks', () => {
  it('returns empty object when no tracked dates exist', async () => {
    expect(await loadTrackedTasks()).toEqual([]);
  });

  it('loads all tracked tasks', async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    const [trackedTaskOne, trackedTaskTwo] = await db
      .insert(trackedTask)
      .values([
        { task_id: dripTask.id, date: '2026-01-01' },
        { task_id: dripTask.id, date: '2026-01-02' },
      ])
      .returning();

    const result = await loadTrackedTasks();
    expect(result).toHaveLength(2);
    expect([...result]).toEqual([
      { date: trackedTaskOne.date, id: trackedTaskOne.id, task_id: dripTask.id, task: dripTask },
      { date: trackedTaskTwo.date, id: trackedTaskTwo.id, task_id: dripTask.id, task: dripTask },
    ]);
  });
});

describe('loadTrackedTasksForDay', () => {
  it('returns empty object when no tracked dates exist', async () => {
    expect(await loadTrackedTasksForDay('2026-01-01')).toEqual([]);
  });

  it('loads all tracked tasks using date', async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    let date = '2026-01-01';
    await db.insert(trackedTask).values([
      { task_id: dripTask.id, date: date },
      { task_id: dripTask.id, date: '2026-01-02' },
    ]);

    const result = await loadTrackedTasksForDay(date);
    expect(result).toHaveLength(1);
    expect(result[0].date).toEqual(date);
    expect(result[0].task_id).toEqual(dripTask.id);
  });
});

describe('createTrackedTask', () => {
  it('inserts and returns the created tracked task', async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    const created = await createTrackedTask(dripTask.id, '2026-01-01');
    expect(created).toMatchObject({});
    expect(created.id).toEqual(expect.any(Number));
    expect(await loadTrackedTasks()).toHaveLength(1);
  });
});

describe('removeTrackedTask', () => {
  it('removes tracked task', async () => {
    const [dripTask] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    const [createdTrackedTask] = await db
      .insert(trackedTask)
      .values([{ task_id: dripTask.id, date: '2026-01-01' }])
      .returning();

    await removeTrackedTask(createdTrackedTask.id);

    expect(await loadTrackedTasks()).toHaveLength(0);
  });
});
