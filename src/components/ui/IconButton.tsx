import { Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export function IconButton({
  onPress,
  disabled = false,
  icon,
  testID,
}: {
  onPress: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  testID?: string;
}) {
  const pressAnim = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressAnim.value }],
    opacity: pressAnim.value ** 4,
  }));

  const onPressIn = () => {
    pressAnim.value = withSpring(0.9);
  };

  const onPressOut = () => {
    pressAnim.value = withSpring(1);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={8}
      disabled={disabled}
      testID={testID}
    >
      <Animated.View style={[styles.button, animatedStyle]}>{icon}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 35,
    height: 35,
    borderRadius: 50,
    backgroundColor: Colors.cellBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
