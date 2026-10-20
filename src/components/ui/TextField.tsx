import { type TextInputProps } from 'react-native';
import { Colors } from '@/constants/theme';
import { CommonStyles } from '@/constants/styles';
import { ErrorText, Input } from '@/components/ui/Typography';

type TextFieldProps = TextInputProps & {
  error?: string | null;
};

export function TextField({ error, style, ...props }: TextFieldProps) {
  return (
    <>
      <Input
        placeholderTextColor={Colors.label}
        {...props}
        style={[CommonStyles.input, error && CommonStyles.inputError, style]}
      />
      {error && <ErrorText style={CommonStyles.errorText}>{error}</ErrorText>}
    </>
  );
}
