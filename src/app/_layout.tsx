import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runMigrations } from '../../db/client';
import Error from '../components/error';
import Loading from '../components/loading';
import { Colors } from '@/constants/theme';
import { SettingsButton } from '@/components/settings-button';
import { CloseButton } from '@/components/close-button';

function RootLayoutContent() {
  const [status, setStatus] = useState<{ success: boolean; error?: Error }>({ success: false });

  useEffect(() => {
    runMigrations()
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
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerShadowVisible: false,
        headerTitle: '',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerRight: () => <SettingsButton /> }} />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerRight: () => <CloseButton />,
        }}
      />
    </Stack>
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
