import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { createCategory } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import { FormSheet } from '@/components/ui/FormSheet';
import { ActionButton } from '@/components/ui/ActionButton';

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
        pathname: pathname ?? '/add-task',
        params: { categoryId: String(created.id), ...(taskId ? { taskId } : {}) },
      });
    } catch (e) {
      setSaving(false);
      setError('Category already exists');
    }
  }, [canSave, name, pathname, taskId]);

  return (
    <FormSheet>
      <Text style={styles.title}>Create Category</Text>
      <TextInput
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError(null);
        }}
        placeholder="category name"
        placeholderTextColor={Colors.label}
        style={[styles.input, error && styles.inputError]}
        autoFocus
        onSubmitEditing={handleSave}
        returnKeyType="done"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <ActionButton label="Save" onPress={handleSave} disabled={!canSave} />
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    paddingVertical: 20,
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
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
    marginTop: -12,
    marginBottom: 16,
  },
});
