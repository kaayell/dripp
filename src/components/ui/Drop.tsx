import { StyleSheet, View } from 'react-native';

type Props = {
  color?: string;
  size: number;
  strokeColor?: string;
  strokeWidth?: number;
};

export default function Drop({ color, size, strokeColor, strokeWidth = 1.5 }: Props) {
  return (
    <View
      style={[
        styles.drop,
        {
          width: size,
          height: size,
          borderTopLeftRadius: size / 2,
          borderTopRightRadius: size / 2,
          borderBottomRightRadius: size / 2,
          backgroundColor: color,
        },
        strokeColor && { borderWidth: strokeWidth, borderColor: strokeColor },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  drop: {
    borderBottomLeftRadius: 0,
    transform: [{ rotate: '135deg' }],
  },
});
