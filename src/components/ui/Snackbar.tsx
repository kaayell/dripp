import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleAlert, CircleCheck, X } from 'lucide-react-native';
import { Colors, dimmed, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

export type SnackbarMessage = { text: string; type: 'success' | 'error' };

export function Snackbar({
  message,
  onDismiss,
}: {
  message: SnackbarMessage;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();
  const color = message.type === 'error' ? Colors.error : Colors.teal;
  const Icon = message.type === 'error' ? CircleAlert : CircleCheck;

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={[
        styles.container,
        { bottom: insets.bottom + Spacing.xl, borderColor: dimmed(color, 40) },
      ]}
    >
      <Icon color={color} size={20} strokeWidth={2.25} />
      <Text style={styles.text}>{message.text}</Text>
      <Pressable testID="snackbar-dismiss" onPress={onDismiss} hitSlop={12}>
        <X color={Colors.icon} size={18} strokeWidth={2.25} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.surface,
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    elevation: 6,
  },
  text: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    flex: 1,
    color: Colors.text,
  },
});
