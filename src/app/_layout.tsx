import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { runMigrations } from '../../db/client';
import Error from '@/components/ui/Error';
import Loading from '@/components/ui/Loading';
import { Colors } from '@/constants/theme';
import { ClockAlert, Plus } from 'lucide-react-native';
import { IconButton } from '@/components/ui/IconButton';

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
        <Stack.Screen
          name="index"
          options={{
            headerRight: () => (
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <IconButton
                  onPress={() => router.push('/overdue-tasks')}
                  icon={<ClockAlert color={Colors.icon} size={20} strokeWidth={2.25} />}
                />
                <IconButton
                  onPress={() => router.push('/add-task')}
                  icon={<Plus color={Colors.icon} size={22} strokeWidth={2.25} />}
                />
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="add-task"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="overdue-tasks"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="task-detail"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="task-picker"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: 'fitToContents',
            sheetCornerRadius: 20,
          }}
        />
        <Stack.Screen
          name="add-category"
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
