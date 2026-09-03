import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { createCategory } from '../../../db/queries';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddCategoryScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={[styles.container, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.handle} />
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
      <Pressable
        onPress={handleSave}
        hitSlop={8}
        disabled={!canSave}
        style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
      >
        <Text style={[styles.saveButtonText, !canSave && styles.saveButtonTextDisabled]}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: 8,
    marginBottom: 8,
  },
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
  saveButton: {
    flex: 1,
    backgroundColor: Colors.coral,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.cellBg,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.background,
  },
  saveButtonTextDisabled: {
    color: Colors.textDimmer,
  },
});
