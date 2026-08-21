import { Tabs } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarIcon: () => null,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '' }} />
    </Tabs>
  );
}
