import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runMigrations } from './db/client';
import { ensureSeeded } from './db/seed';
import CalendarScreen from './src/CalendarScreen';
import { BACKGROUND, CORAL, TEXT } from './src/theme';

export default function App() {
  const [status, setStatus] = useState<{ success: boolean; error?: Error }>({ success: false });

  useEffect(() => {
    runMigrations()
      .then(() => ensureSeeded())
      .then(() => setStatus({ success: true }))
      .catch((error) => setStatus({ success: false, error }));
  }, []);

  return (
    <SafeAreaProvider>
      {status.error ? (
        <View style={{ flex: 1, backgroundColor: BACKGROUND, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Text style={{ color: CORAL, textAlign: 'center' }}>Database migration failed: {status.error.message}</Text>
        </View>
      ) : !status.success ? (
        <View style={{ flex: 1, backgroundColor: BACKGROUND, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: TEXT }}>Loading…</Text>
        </View>
      ) : (
        <CalendarScreen />
      )}
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
