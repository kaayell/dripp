// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from './20260817180433_init/migration.sql';
import m0001 from './20260831210401_update-tracked-task-fk/migration.sql';
import m0002 from './20260904215451_rename-tracked-task-to-task-log/migration.sql';
import m0003 from './20260916180633_add-unique-constraints/migration.sql';
import m0004 from './20260921164919_add-task-reminder/migration.sql';
import m0005 from './20260924171426_add-audit-timestamps/migration.sql';
import m0006 from './20261006165040_add-task-notes/migration.sql';

export default {
    migrations: {
      "20260817180433_init": m0000,
      "20260831210401_update-tracked-task-fk": m0001,
      "20260904215451_rename-tracked-task-to-task-log": m0002,
      "20260916180633_add-unique-constraints": m0003,
      "20260921164919_add-task-reminder": m0004,
      "20260924171426_add-audit-timestamps": m0005,
      "20261006165040_add-task-notes": m0006
  }
}
