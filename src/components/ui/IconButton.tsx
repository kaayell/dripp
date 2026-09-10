import { Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export function IconButton({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.button}>
      {children}
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
