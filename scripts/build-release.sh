#!/usr/bin/env bash
# Builds and installs a release APK signed with the real keystore from
# credentials.json (see `npx eas-cli credentials:configure-build -p android -e preview`).
# Fails outright if credentials.json is missing.
set -euo pipefail
cd "$(dirname "$0")/.."

store_file=$(node -e "console.log(require('path').resolve(require('./credentials.json').android.keystore.keystorePath))")
store_password=$(node -e "console.log(require('./credentials.json').android.keystore.keystorePassword)")
key_alias=$(node -e "console.log(require('./credentials.json').android.keystore.keyAlias)")
key_password=$(node -e "console.log(require('./credentials.json').android.keystore.keyPassword)")

(cd android && ./gradlew assembleRelease \
  -Pandroid.injected.signing.store.file="$store_file" \
  -Pandroid.injected.signing.store.password="$store_password" \
  -Pandroid.injected.signing.key.alias="$key_alias" \
  -Pandroid.injected.signing.key.password="$key_password")

adb install -r android/app/build/outputs/apk/release/app-release.apk
