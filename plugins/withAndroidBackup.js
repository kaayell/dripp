const fs = require('fs');
const path = require('path');
const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');

// Android Auto Backup (Android 12+): back up only the SQLite database
// (op-sqlite stores it in the app's databases/ directory). Everything else —
// notification state, caches, widget state — is rebuilt on launch.
const DATA_EXTRACTION_RULES = `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="database" path="." />
    </cloud-backup>
    <device-transfer>
        <include domain="database" path="." />
    </device-transfer>
</data-extraction-rules>
`;

function withBackupRuleFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const xmlDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      await fs.promises.mkdir(xmlDir, { recursive: true });
      await fs.promises.writeFile(
        path.join(xmlDir, 'data_extraction_rules.xml'),
        DATA_EXTRACTION_RULES,
      );
      return config;
    },
  ]);
}

function withBackupManifest(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application[0];
    app.$['android:allowBackup'] = 'true';
    app.$['android:dataExtractionRules'] = '@xml/data_extraction_rules';
    delete app.$['android:fullBackupContent'];
    return config;
  });
}

module.exports = function withAndroidBackup(config) {
  return withBackupManifest(withBackupRuleFiles(config));
};
