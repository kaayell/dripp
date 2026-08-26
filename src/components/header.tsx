import { Pressable, StyleSheet, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Settings, X } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const onSettingsScreen = pathname === '/settings';
  const Icon = onSettingsScreen ? X : Settings;

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => (onSettingsScreen ? router.back() : router.push('/settings'))}
        hitSlop={8}
      >
        <Icon color={Colors.coral} size={22} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
  },
});
