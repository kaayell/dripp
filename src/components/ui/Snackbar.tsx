import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleAlert, CircleCheck, X } from 'lucide-react-native';
import { Colors, dimmed } from '@/constants/theme';

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
      style={[styles.container, { bottom: insets.bottom + 16, borderColor: dimmed(color, 40) }]}
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
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: Colors.cellBg,
    elevation: 6,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
});
