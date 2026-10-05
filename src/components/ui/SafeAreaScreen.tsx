import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export function SafeAreaScreen({
  children,
  scroll,
  padded = true,
  contentStyle,
}: PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}>) {
  const insets = useSafeAreaInsets();
  const content = [padded && styles.padded, { paddingBottom: insets.bottom + 24 }, contentStyle];

  return scroll ? (
    <ScrollView style={styles.screen} contentContainerStyle={content}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screen, content]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  padded: {
    padding: 16,
  },
});
