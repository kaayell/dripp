import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { runMigrations } from '../../db/client';
import Error from '../components/Error';
import Loading from '../components/Loading';
import { Colors } from '@/constants/theme';
import { AddTaskButton } from '@/components/AddTaskButton';

export default function Layout() {
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
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerTitle: '',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerRight: () => <AddTaskButton /> }} />
        <Stack.Screen
          name="add-task"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="task-picker"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.25, 0.5, 1],
            sheetInitialDetentIndex: 1,
            sheetCornerRadius: 20,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
