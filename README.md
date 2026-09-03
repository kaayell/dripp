# dripp

A body + household-chore tracking calendar (Expo / React Native) **android only**.

## Running it

This app uses `@op-engineering/op-sqlite`, a **native module**, so it will not
run in plain Expo Go. Use a dev-client build instead.

### First time on a clean simulator/device

```bash
npx expo run:android
```

### After that (JS/TS-only changes)

Once the app is installed, you don't need to rebuild for plain code changes:

```bash
npx expo start
```

### Rebuilding

Re-run `npx expo run:android` any time you add/upgrade a native dependency,
or change native config (`app.json`'s `android`/`ios` keys, `metro.config.js`,
`babel.config.js`).

If Metro and the app get out of sync (stale bundle, weird cache errors),
kill Metro and restart with a clean cache:

```bash
npx expo prebuild --clean
npx expo start --clear
```

### Resetting app data on the emulator

```bash
adb shell pm clear com.kaayell.dripp   # wipes the on-device sqlite db + AsyncStorage
```

## Building for distribution (EAS)

```bash
npx eas-cli login
```

```bash
# internal build — installable APK
npx eas-cli build --platform android --profile preview
```

### Manual build (plain Gradle, no EAS)

**One-time setup:** pull down the real Android signing keystore. This writes
`credentials.json` and `credentials/android/keystore.jks` — both gitignored,
never commit them.

```bash
npx eas-cli credentials:configure-build -p android -e preview
```

Then build and install the release APK directly:

```bash
./scripts/build-release.sh
```

## Database (Drizzle + op-sqlite)

### Changing the schema

1. Edit `db/schema.ts`.
2. Generate a migration:
   ```bash
   npx drizzle-kit generate
   ```
   This writes a new folder under `drizzle/` and updates
   `drizzle/migrations.js`.
3. Rebuild/reload the app — `runMigrations()` applies any new migration
   automatically on next launch.

### Poking at the on-device database directly

```bash
# pull the sqlite file off the emulator/device
adb exec-out run-as com.kaayell.dripp cat databases/db > /tmp/dripp.db
sqlite3 /tmp/dripp.db ".tables"
sqlite3 /tmp/dripp.db "select * from categories;"
sqlite3 /tmp/dripp.db "select * from tasks;"
```
