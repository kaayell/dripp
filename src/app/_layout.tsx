import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { runMigrations } from '../../db/client';
import { ensureSeeded } from '../../db/seed';
import Header from '../components/header';
import Error from '../components/error';
import Loading from '../components/loading';
import { Colors } from '@/constants/theme';

function RootLayoutContent() {
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<{ success: boolean; error?: Error }>({ success: false });

  useEffect(() => {
    runMigrations()
      .then(() => ensureSeeded())
      .then(() => setStatus({ success: true }))
      .catch((error) => setStatus({ success: false, error }));
  }, []);

  if (status.error) {
    return <Error message={status.error.message} />;
  }

  if (!status.success) {
    return <Loading />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: insets.top }}>
      <Header />

      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutContent />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
