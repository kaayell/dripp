import { StyleSheet, View } from 'react-native';

type Props = {
  color?: string;
  size: number;
};

export default function Drop({ color, size }: Props) {
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
