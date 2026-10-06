import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { runMigrations } from '../../db/client';
import '@/notifications/listeners';
import Error from '@/components/ui/Error';
import Loading from '@/components/ui/Loading';
import { Colors } from '@/constants/theme';
import { ClockAlert, DatabaseBackup, Plus } from 'lucide-react-native';
import { IconButton } from '@/components/ui/IconButton';
import { backfillDatedReminders } from '@/notifications/reminders';
import { useNotificationNavigation } from '@/notifications/useNotificationNavigation';
import { refreshQuickLogWidget } from '@/widget/widgetTaskHandler';

export default function Layout() {
  const [status, setStatus] = useState<{ success: boolean; error?: Error }>({ success: false });

  useEffect(() => {
    runMigrations()
      .then(() => {
        setStatus({ success: true });
        backfillDatedReminders().catch((e) => console.error('[Layout] reminder top-up failed', e));
      })
      .catch((error) => setStatus({ success: false, error }));
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'background') return;
      refreshQuickLogWidget().catch((e) => console.error('[Layout] widget refresh failed', e));
    });
    return () => subscription.remove();
  }, []);

  useNotificationNavigation(status.success);

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
        <Stack.Screen
          name="index"
          options={{
            headerRight: () => (
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <IconButton
                  testID="import-export-button"
                  onPress={() => router.push('/import-export')}
                  icon={<DatabaseBackup color={Colors.icon} size={20} strokeWidth={2.25} />}
                />
                <IconButton
                  onPress={() => router.push('/task/overdue')}
                  icon={<ClockAlert color={Colors.icon} size={20} strokeWidth={2.25} />}
                />
                <IconButton
                  testID="add-task-button"
                  onPress={() => router.push('/task/add')}
                  icon={<Plus color={Colors.icon} size={22} strokeWidth={2.25} />}
                />
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="task/add"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="task/overdue"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="import-export/index"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="task/[taskId]"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="task/picker"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetCornerRadius: 20,
          }}
        />
        <Stack.Screen
          name="task/note"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetCornerRadius: 20,
          }}
        />
        <Stack.Screen
          name="import-export/preview"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="category/add"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetCornerRadius: 20,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
