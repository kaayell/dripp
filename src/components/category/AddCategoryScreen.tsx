import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { createCategory } from '../../../db/queries';
import { Spacing } from '@/constants/theme';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { ActionButton } from '@/components/ui/ActionButton';
import { TextField } from '@/components/ui/TextField';
import { Heading } from '@/components/ui/Typography';

export default function AddCategoryScreen() {
  const { pathname, taskId } = useLocalSearchParams<{ pathname?: string; taskId?: string }>();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = name.trim().length > 0 && !saving;

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createCategory(name.trim());
      router.dismissTo({
        pathname: pathname ?? '/task/add',
        params: { categoryId: String(created.id), ...(taskId ? { taskId } : {}) },
      });
    } catch (e) {
      setSaving(false);
      setError('Category already exists');
    }
  }, [canSave, name, pathname, taskId]);

  return (
    <SafeAreaScreen sheet>
      <Heading style={styles.title}>Create Category</Heading>
      <TextField
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError(null);
        }}
        placeholder="category name"
        error={error}
        autoFocus
        onSubmitEditing={handleSave}
        returnKeyType="done"
      />
      <ActionButton label="Save" onPress={handleSave} disabled={!canSave} />
    </SafeAreaScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingBottom: Spacing.xl,
  },
});
