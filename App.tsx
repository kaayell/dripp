import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { runMigrations } from './db/client';
import { ensureSeeded } from './db/seed';
import Header from './src/Header';
import Footer from './src/Footer';
import CalendarScreen from './src/calendar/CalendarScreen';
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
      <Header />

      <View style={{ flex: 1 }}>
        <CalendarScreen />
      </View>

      <Footer />
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
