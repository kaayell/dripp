import { open } from '@op-engineering/op-sqlite';
import { drizzle } from 'drizzle-orm/op-sqlite';
import { migrate } from 'drizzle-orm/op-sqlite/migrator';
import migrations from '../drizzle/migrations';

const opsqliteDb = open({ name: 'db' });

export const db = drizzle(opsqliteDb);

// Memoized so React's dev-mode double-invoked effects (New Architecture)
// can't run this non-idempotent migration twice concurrently.
let migrationPromise: ReturnType<typeof migrate> | null = null;

export function runMigrations(): ReturnType<typeof migrate> {
  if (!migrationPromise) {
    migrationPromise = migrate(db, migrations);
  }
  return migrationPromise;
}
