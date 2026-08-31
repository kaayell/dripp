// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from './20260817180433_init/migration.sql';
import m0001 from './20260831210401_update-tracked-task-fk/migration.sql';

export default {
    migrations: {
      "20260817180433_init": m0000,
      "20260831210401_update-tracked-task-fk": m0001
    }
}
