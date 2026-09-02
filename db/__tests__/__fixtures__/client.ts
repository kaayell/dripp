import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/node-sqlite';
import { relations } from '../../schema';
import migrations from '../../../drizzle/migrations';

const sqlite = new DatabaseSync(':memory:');
const migrationSql: Record<string, string> = migrations.migrations;
for (const name of Object.keys(migrationSql).sort()) {
  for (const statement of migrationSql[name].split('--> statement-breakpoint')) {
    sqlite.exec(statement);
  }
}

export const db = drizzle({ client: sqlite, relations });
