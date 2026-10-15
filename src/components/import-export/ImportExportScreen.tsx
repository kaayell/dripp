import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen.tsx';
import { describeCounts } from '@/import-export/describeCounts.ts';
import { ActionButton } from '@/components/ui/ActionButton';
import { CloseButton } from '@/components/ui/CloseButton';
import { Snackbar, SnackbarMessage } from '@/components/ui/Snackbar';
import { Colors, dimmed, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import { FileDown, FileUp } from 'lucide-react-native';
import { AppData, exportAppData } from '../../../db/queries.ts';
import { errorMessage } from '@/constants/error.ts';
import { Directory } from 'expo-file-system';
import { todayString } from '@/constants/dates';

export default function ImportExportScreen() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<SnackbarMessage | null>(null);

  const saveExportFile = async (data: AppData): Promise<string | null> => {
    let directory: Directory;
    try {
      directory = await Directory.pickDirectoryAsync();
    } catch (e) {
      if ((e as { code?: string } | null)?.code === 'ERR_PICKER_CANCELLED') return null;
      throw e;
    }

    const fileName = `dripp-export-${todayString()}.json`;
    const file = directory.createFile(fileName, 'application/json');
    file.write(JSON.stringify(data, null, 2));
    return file.name;
  };

  const onExport = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const data = await exportAppData();
      const fileName = await saveExportFile(data);
      if (fileName) {
        setMessage({
          text: `Saved ${fileName} (${describeCounts(data)})`,
          type: 'success',
        });
      }
    } catch (e) {
      console.error('[ImportExportScreen] export failed', e);
      setMessage({ text: errorMessage(e), type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const onPickImport = () => {
    setMessage(null);
    router.push('/import-export/preview');
  };

  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <CloseButton /> }} />
      <SafeAreaScreen scroll>
        <View style={styles.card}>
          <View style={styles.descriptionContainer}>
            <View style={[styles.icon, { backgroundColor: dimmed(Colors.teal, 10) }]}>
              <FileDown color={dimmed(Colors.teal, 90)} size={32} strokeWidth={2.25} />
            </View>
            <Text style={styles.title}>Export</Text>
            <Text style={styles.subtitle}>Save all tasks, logs and reminders.</Text>
          </View>
          <ActionButton testID="export-button" label="Export" onPress={onExport} disabled={busy} />
        </View>

        <View style={styles.card}>
          <View style={styles.descriptionContainer}>
            <View style={[styles.icon, { backgroundColor: dimmed(Colors.teal, 10) }]}>
              <FileUp color={dimmed(Colors.teal, 90)} size={32} strokeWidth={2.25} />
            </View>
            <Text style={styles.title}>Import</Text>
            <Text style={styles.subtitle}>Load data from a dripp export file.</Text>
          </View>
          <ActionButton
            testID="import-button"
            label="Import"
            onPress={onPickImport}
            disabled={busy}
          />
        </View>
      </SafeAreaScreen>
      {message && <Snackbar message={message} onDismiss={() => setMessage(null)} />}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    ...CommonStyles.surface,
    overflow: 'hidden',
    padding: Spacing.xxl,
    gap: Spacing.base,
    marginBottom: Spacing.xxl,
  },
  descriptionContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  icon: {
    ...CommonStyles.circle,
    width: 60,
    height: 60,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.icon,
  },
});
