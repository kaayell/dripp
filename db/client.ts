import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { migrate } from 'drizzle-orm/op-sqlite/migrator';
import migrations from '../drizzle/migrations';
import { relations } from './schema';

const opsqliteDb = open({ name: 'db' });

export const db = drizzle<typeof relations>(opsqliteDb, { relations });

let migrationPromise: ReturnType<typeof migrate> | null = null;

export function runMigrations(): ReturnType<typeof migrate> {
  if (!migrationPromise) {
    migrationPromise = migrate(db, migrations);
  }
  return migrationPromise;
}
