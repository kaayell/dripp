import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { createCategory } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import { FormSheet } from '@/components/ui/FormSheet';
import { SaveButton } from '@/components/ui/SaveButton';

export default function AddCategoryScreen() {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  const handleSave = useCallback(async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const created = await createCategory(name.trim());
      router.dismissTo({
        pathname: '/add-task',
        params: { categoryId: String(created.id) },
      });
    } catch (e) {
      console.error('[AddCategoryScreen] create category failed', e);
      setSaving(false);
    }
  }, [canSave, name]);

  return (
    <FormSheet>
      <Text style={styles.title}>Create Category</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="category name"
        placeholderTextColor={Colors.textDim}
        style={styles.input}
        autoFocus
        onSubmitEditing={handleSave}
        returnKeyType="done"
      />
      <SaveButton onPress={handleSave} disabled={!canSave} />
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.cellBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 20,
  },
});
