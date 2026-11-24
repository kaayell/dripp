import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { type Href, router, Stack } from 'expo-router';
import { ArrowUpDown, ChevronRight, DatabaseBackup } from 'lucide-react-native';
import { Colors, Spacing } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { CloseButton } from '@/components/ui/CloseButton';
import { ItemTitle, Title } from '@/components/ui/Typography';

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerLeft: () => <CloseButton /> }} />
      <SafeAreaScreen scroll>
        <Title style={styles.title}>Settings</Title>
        <SettingsRow
          testID="settings-reorder-categories"
          label="Reorder Categories"
          href="/category/reorder"
          icon={<ArrowUpDown color={Colors.icon} size={20} strokeWidth={2.25} />}
        />
        <SettingsRow
          testID="settings-import-export"
          label="Import / Export"
          href="/import-export"
          icon={<DatabaseBackup color={Colors.icon} size={20} strokeWidth={2.25} />}
        />
      </SafeAreaScreen>
    </>
  );
}

function SettingsRow({
  label,
  href,
  icon,
  testID,
}: {
  label: string;
  href: Href;
  icon: ReactNode;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.icon}>{icon}</View>
      <ItemTitle style={styles.label}>{label}</ItemTitle>
      <ChevronRight color={Colors.label} size={20} strokeWidth={2.25} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingBottom: Spacing.xxl,
  },
  row: {
    ...CommonStyles.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.base,
  },
  rowPressed: {
    opacity: 0.7,
  },
  icon: {
    ...CommonStyles.circle,
    width: 35,
    height: 35,
  },
  label: {
    flex: 1,
  },
});
