jest.mock('../client', () => require('./__fixtures__/client'));

import { db } from '../client';
import {
  createTask,
  loadCategories,
  loadTasks,
  loadTrackedDates,
  setTrackedDate,
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

describe('loadTrackedDates', () => {
  it('returns empty object when no tracked dates exist', async () => {
    expect(await loadTrackedDates()).toEqual({});
  });

  it('groups dates by task id', async () => {
    const [task] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    await db.insert(trackedTask).values([
      { task_id: task.id, date: '2026-01-01' },
      { task_id: task.id, date: '2026-01-02' },
    ]);

    const result = await loadTrackedDates();

    expect(result[task.id]).toEqual(new Set(['2026-01-01', '2026-01-02']));
  });
});

describe('setTrackedDate', () => {
  it('marks a date as tracked when it is not already tracked', async () => {
    const [task] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    await setTrackedDate(task.id, '2026-01-01', true);

    const result = await loadTrackedDates();
    expect(result[task.id]).toEqual(new Set(['2026-01-01']));
  });

  it('does not duplicate an already tracked date', async () => {
    const [task] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    await setTrackedDate(task.id, '2026-01-01', true);
    await setTrackedDate(task.id, '2026-01-01', true);

    const rows = await db.select().from(trackedTask);
    expect(rows).toHaveLength(1);
  });

  it('unmarks a tracked date', async () => {
    const [task] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();
    await setTrackedDate(task.id, '2026-01-01', true);

    await setTrackedDate(task.id, '2026-01-01', false);

    expect(await loadTrackedDates()).toEqual({});
  });

  it('is a no-op when unmarking a date that was never tracked', async () => {
    const [task] = await db
      .insert(tasks)
      .values({ name: 'drip', color: '#ffffff', categoryId: null })
      .returning();

    await expect(setTrackedDate(task.id, '2026-01-01', false)).resolves.toBeUndefined();
    expect(await loadTrackedDates()).toEqual({});
  });
});
