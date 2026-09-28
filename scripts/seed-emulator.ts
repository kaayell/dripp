// Replaces the app's data on a connected emulator/device with sample data.
// Pulls the op-sqlite db via adb, rewrites it locally with drizzle + node:sqlite, then pushes it back.
// Requires a debuggable build (run-as) that has been launched at least once so migrations ran.
//
// Usage: node --no-warnings scripts/seed-emulator.ts [--serial emulator-5554] || npm run seed
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-sqlite';
import { categories, reminders, relations, taskLog, tasks } from '../db/schema.ts';

type ReminderSeed = Omit<
  typeof reminders.$inferInsert,
  'taskId' | 'id' | 'createdAt' | 'updatedAt'
>;
type TaskSeed = {
  name: string;
  color: string;
  category: string | null;
  averageGapDays: number;
  reminder?: ReminderSeed;
};

const PACKAGE = 'com.kaayell.dripp';
const DB_PATH = 'databases/db';
const DEVICE_TMP = '/data/local/tmp/dripp-seed.db';
const HISTORY_DAYS = 400;

const CATEGORIES = ['bod', 'home', 'cats'];

const TASKS: TaskSeed[] = [
  {
    name: 'drip',
    color: '#ec5b57',
    category: 'bod',
    averageGapDays: 20,
  },
  {
    name: 'walk',
    color: '#e18b60',
    category: 'bod',
    averageGapDays: 2,
  },
  {
    name: 'vacuum',
    color: '#60e165',
    category: 'home',
    averageGapDays: 5,
  },
  {
    name: 'mop',
    color: '#64a1ee',
    category: 'home',
    averageGapDays: 7,
  },
  {
    name: 'sheets',
    color: '#b386e4',
    category: 'home',
    averageGapDays: 14,
    reminder: { type: 'weekly', interval: 2, dayOfWeek: 0, time: '11:00' },
  },
  {
    name: 'laundry',
    color: '#e160e1',
    category: 'home',
    averageGapDays: 6,
    reminder: { type: 'weekly', interval: 2, dayOfWeek: 0, time: '11:00' },
  },
  {
    name: 'litter box',
    color: '#daa932',
    category: 'cats',
    averageGapDays: 3,
  },
  {
    name: 'fountain',
    color: '#00b7c1',
    category: 'cats',
    averageGapDays: 14,
    reminder: { type: 'weekly', interval: 2, dayOfWeek: 2, time: '09:00' },
  },
];

const serialIndex = process.argv.indexOf('--serial');
const serialArgs = serialIndex === -1 ? [] : ['-s', process.argv[serialIndex + 1]];

function adb(...args: string[]): Buffer {
  return execFileSync('adb', [...serialArgs, ...args], {
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function runAs(command: string): Buffer {
  return adb('shell', `run-as ${PACKAGE} sh -c '${command}'`);
}

// Deterministic so every seed produces the same data (relative to today).
let seed = 42;
function random(): number {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32;
  return seed / 2 ** 32;
}

function localDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function logDates(averageGapDays: number): string[] {
  const dates: string[] = [];
  let daysAgo = Math.floor(random() * averageGapDays);
  while (daysAgo < HISTORY_DAYS) {
    dates.push(localDate(daysAgo));
    // Jitter the gap between 50% and 150% of the average.
    daysAgo += Math.max(1, Math.round(averageGapDays * (0.5 + random())));
  }
  return dates;
}

function seedDatabase(file: string): number {
  const sqlite = new DatabaseSync(file);
  const db = drizzle({ client: sqlite, relations });

  const logCount = db.transaction((tx) => {
    tx.delete(reminders).run();
    tx.delete(taskLog).run();
    tx.delete(tasks).run();
    tx.delete(categories).run();
    tx.run(
      sql`DELETE FROM sqlite_sequence WHERE name IN ('reminders', 'task_log', 'tasks', 'categories')`,
    );

    const created = tx
      .insert(categories)
      .values(CATEGORIES.map((name) => ({ name })))
      .returning()
      .all();
    const categoryIds = new Map(created.map(({ id, name }) => [name, id]));

    let count = 0;
    for (const { name, color, category, averageGapDays, reminder } of TASKS) {
      const categoryId = category ? categoryIds.get(category) : null;
      const task = tx.insert(tasks).values({ name, color, categoryId }).returning().get();

      const dates = logDates(averageGapDays);
      tx.insert(taskLog)
        .values(dates.map((date) => ({ task_id: task.id, date })))
        .run();
      count += dates.length;

      if (reminder) {
        tx.insert(reminders)
          .values({ taskId: task.id, ...reminder })
          .run();
      }
    }
    return count;
  });

  sqlite.exec('PRAGMA journal_mode = DELETE');
  sqlite.close();
  return logCount;
}

const workDir = mkdtempSync(join(tmpdir(), 'dripp-seed-'));
const localDb = join(workDir, 'db');
try {
  adb('shell', 'am', 'force-stop', PACKAGE);

  const hasDb = runAs(`test -f ${DB_PATH} && echo yes || echo no`).toString().trim();
  if (hasDb !== 'yes') {
    throw new Error(`No ${DB_PATH} for ${PACKAGE}. Launch the app once so migrations run.`);
  }

  writeFileSync(localDb, adb('exec-out', 'run-as', PACKAGE, 'cat', DB_PATH));
  const logCount = seedDatabase(localDb);

  adb('push', localDb, DEVICE_TMP);
  runAs(`cat ${DEVICE_TMP} > ${DB_PATH} && rm -f ${DB_PATH}-wal ${DB_PATH}-shm`);
  adb('shell', 'rm', '-f', DEVICE_TMP);

  adb('shell', 'monkey', '-p', PACKAGE, '-c', 'android.intent.category.LAUNCHER', '1');
  console.log(
    `Seeded ${CATEGORIES.length} categories, ${TASKS.length} tasks, ${logCount} logs. App relaunched.`,
  );
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
