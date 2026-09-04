jest.mock('../client', () => require('./__fixtures__/client'));

import { db } from '../client';
import {
  createCategory,
  createTask,
  createTaskLog,
  loadCategories,
  loadTask,
  loadTasks,
  loadTasksWithHistory,
  loadTaskWithDetails,
  loadTaskLogs,
  loadTaskLogsForDay,
  removeTaskLog,
  updateTask,
} from '../queries';
import { categories, tasks, taskLog } from '../schema';

afterEach(async () => {
  await db.delete(taskLog);
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
    expect(result).toEqual(task);
  });
});

describe('loadTaskWithDetails', () => {
  it('returns empty array when no task exist', async () => {
    expect(await loadTaskWithDetails(12)).toEqual(undefined);
  });

  it('returns task with task logs', async () => {
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
    expect(result?.taskLogs).toEqual([logOne, logTwo]);
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

    const result = await loadTasksWithHistory();
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
      { date: logOne.date, id: logOne.id, task_id: dripTask.id, task: dripTask },
      { date: logTwo.date, id: logTwo.id, task_id: dripTask.id, task: dripTask },
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
    expect(created).toMatchObject({});
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
