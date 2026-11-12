import { useEffect } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const STROKE_WIDTH = 1.75;

type Props = {
  hidden: boolean;
  onPress: () => void;
  color: string;
  hiddenColor?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export default function VisibilityToggle({
  hidden,
  onPress,
  color,
  hiddenColor = color,
  size = 20,
  style,
}: Props) {
  const progress = useSharedValue(hidden ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(hidden ? 1 : 0, {
      duration: 100,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [hidden, progress]);

  const eyeStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const eyeOffStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Pressable hitSlop={8} style={style} onPress={onPress}>
      <Animated.View style={{ width: size, height: size }}>
        <Animated.View style={[StyleSheet.absoluteFill, eyeStyle]}>
          <Eye color={color} size={size} strokeWidth={STROKE_WIDTH} />
        </Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, eyeOffStyle]}>
          <EyeOff color={hiddenColor} size={size} strokeWidth={STROKE_WIDTH} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
