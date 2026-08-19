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
    { name: 'litter box', color: '#daa932' },
    { name: 'vacuum', color: '#5ec386' },
    { name: 'mop', color: '#64a1ee' },
    { name: 'sheets', color: '#b386e4' },
    { name: 'laundry', color: '#da85b6' },
    { name: 'towels', color: '#50bfbe' },
  ].map((task) => ({ ...task, categoryId: categoryHouse.id }));

  await db.insert(tasks).values([...bodTasks, ...houseTasks]);
}
