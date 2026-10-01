import { Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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
  const pressAnim = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressAnim.value }],
    opacity: pressAnim.value ** 4,
  }));

  const onPressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    pressAnim.value = withSpring(0.9);
  };

  const onPressOut = () => {
    pressAnim.value = withSpring(1);
  };

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={8}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          destructive && styles.destructive,
          disabled && styles.disabled,
          animatedStyle,
        ]}
      >
        <Text style={[styles.text, disabled && styles.textDisabled]}>{label}</Text>
      </Animated.View>
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
