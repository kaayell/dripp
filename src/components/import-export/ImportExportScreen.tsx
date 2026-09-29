import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '@/components/ui/ActionButton';
import { CloseButton } from '@/components/ui/CloseButton';
import { Snackbar, SnackbarMessage } from '@/components/ui/Snackbar';
import { Colors, dimmed } from '@/constants/theme';
import { FileDown } from 'lucide-react-native';
import { AppData, exportAppData } from '../../../db/queries.ts';
import { Directory } from 'expo-file-system';
import { format } from 'date-fns';

function exportDescription(data: AppData): string {
  return [
    `${data.tasks.length} tasks`,
    `${data.categories.length} categories`,
    `${data.tasks.reduce((count, task) => count + task.logs.length, 0)} logs`,
    `${data.tasks.filter((task) => task.reminder).length} reminders`,
  ].join(', ');
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function ImportExportScreen() {
  const insets = useSafeAreaInsets();
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

    const fileName = `dripp-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
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
          text: `Saved ${fileName} (${exportDescription(data)})`,
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

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerLeft: () => <CloseButton /> }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[{ paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.card}>
          <View style={styles.descriptionContainer}>
            <View style={[styles.icon, { backgroundColor: dimmed(Colors.teal, 10) }]}>
              <FileDown color={dimmed(Colors.teal, 90)} size={32} strokeWidth={2.25} />
            </View>
            <Text style={styles.title}>Export</Text>
            <Text style={styles.subtitle}>Save all tasks, logs and reminders.</Text>
          </View>
          <ActionButton label="Export" onPress={onExport} disabled={busy} />
        </View>
      </ScrollView>
      {message && <Snackbar message={message} onDismiss={() => setMessage(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.cellBg,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
    gap: 10,
    marginBottom: 20,
  },
  descriptionContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.icon,
  },
});
