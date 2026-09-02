import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <NativeTabs tintColor={Colors.text} backgroundColor={Colors.cellBg} iconColor={Colors.textDim}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
        <NativeTabs.Trigger.Label hidden />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="task-list-history">
        <NativeTabs.Trigger.Icon sf="clock.arrow.circlepath" md="history" />
        <NativeTabs.Trigger.Label hidden />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
        <NativeTabs.Trigger.Label hidden />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
