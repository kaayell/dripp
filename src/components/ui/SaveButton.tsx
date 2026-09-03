import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/theme';

export function SaveButton({
  onPress,
  disabled,
}: {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      disabled={disabled}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>Save</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.coral,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.cellBg,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.background,
  },
  textDisabled: {
    color: Colors.textDimmer,
  },
});
