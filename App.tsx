import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { runMigrations } from './db/client';
import { ensureSeeded } from './db/seed';
import AppHeader from './src/AppHeader';
import AppFooter from './src/AppFooter';
import CalendarScreen from './src/CalendarScreen';
import ErrorScreen from './src/ErrorScreen';
import LoadingScreen from './src/LoadingScreen';
import { BACKGROUND } from './src/theme';

function AppContent() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<{ success: boolean; error?: Error }>({ success: false });

  useEffect(() => {
    runMigrations()
      .then(() => ensureSeeded())
      .then(() => setStatus({ success: true }))
      .catch((error) => setStatus({ success: false, error }));
  }, []);

  if (status.error) {
    return <ErrorScreen message={status.error.message} />;
  }

  if (!status.success) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: BACKGROUND, paddingTop: insets.top }}>
      <AppHeader />

      <View style={{ flex: 1 }}>
        <CalendarScreen />
      </View>

      <AppFooter />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
