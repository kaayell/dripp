import type { PropsWithChildren } from 'react';
import { ScrollView, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export function SafeAreaScreen({
  children,
  scroll,
  sheet,
  padded = true,
  contentStyle,
}: PropsWithChildren<{
  scroll?: boolean;
  sheet?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}>) {
  const insets = useSafeAreaInsets();
  const content = [padded && styles.padded, { paddingBottom: insets.bottom + 16 }, contentStyle];
  const handle = sheet && <View style={styles.handle} />;

  return scroll ? (
    <ScrollView style={styles.screen} contentContainerStyle={content}>
      {handle}
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screen, content]}>
      {handle}
      {children}
    </View>
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
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 16,
  },
});
