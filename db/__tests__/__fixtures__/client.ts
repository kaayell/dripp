import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/node-sqlite';

const sqlite = new DatabaseSync(':memory:');
const migrationSql = fs.readFileSync(
  path.join(__dirname, '../../../drizzle/20260817180433_init/migration.sql'),
  'utf8',
);
for (const statement of migrationSql.split('--> statement-breakpoint')) {
  sqlite.exec(statement);
}

export const db = drizzle({ client: sqlite });
