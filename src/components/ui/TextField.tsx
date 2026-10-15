import { Text, TextInput, type TextInputProps } from 'react-native';
import { Colors } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';

type TextFieldProps = TextInputProps & {
  error?: string | null;
};

export function TextField({ error, style, ...props }: TextFieldProps) {
  return (
    <>
      <TextInput
        placeholderTextColor={Colors.label}
        {...props}
        style={[CommonStyles.input, error && CommonStyles.inputError, style]}
      />
      {error && <Text style={CommonStyles.errorText}>{error}</Text>}
    </>
  );
}
