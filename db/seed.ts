import { db } from './client';
import { categories, tasks } from './schema';
import { CORAL } from '../src/theme';

let seedPromise: Promise<void> | null = null;

export function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = seed();
  }
  return seedPromise;
}

async function seed(): Promise<void> {
  const [existing] = await db.select().from(categories).limit(1);
  if (existing) return;

  const [categoryBod] = await db.insert(categories).values({ name: 'bod' }).returning();
  const bodTasks = [{ name: 'drip', color: CORAL, categoryId: categoryBod.id }];

  const [categoryHouse] = await db.insert(categories).values({ name: 'house' }).returning();
  const houseTasks = [
    { name: 'litterbox', color: '#3987e5' },
    { name: 'sheets', color: '#d95926' },
    { name: 'vacuum', color: '#199e70' },
    { name: 'laundry', color: '#c98500' },
    { name: 'mop', color: '#d55181' },
  ].map((task) => ({ ...task, categoryId: categoryHouse.id }));

  await db.insert(tasks).values([...bodTasks, ...houseTasks]);
}
