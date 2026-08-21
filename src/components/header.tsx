import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

export const APP_HEADER_HEIGHT = 56;

export default function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        <Image source={require('@/assets/icon.png')} style={{ width: 32, height: 32 }} />
        <Text style={styles.headerTitle}>Dripp</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: APP_HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: -0.2,
  },
});
