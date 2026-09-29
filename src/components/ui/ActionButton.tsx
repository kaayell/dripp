import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/theme';

export function ActionButton({
  label,
  onPress,
  disabled,
  destructive,
  testID,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={8}
      disabled={disabled}
      style={[styles.button, destructive && styles.destructive, disabled && styles.disabled]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.teal,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructive: {
    backgroundColor: Colors.error,
  },
  disabled: {
    backgroundColor: Colors.cellBg,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.background,
  },
  textDisabled: {
    color: Colors.disabled,
  },
});
