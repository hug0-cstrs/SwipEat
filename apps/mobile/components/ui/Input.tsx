import { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string | null;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Si true, affiche un bouton œil pour toggler la visibilité */
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  leftIcon,
  isPassword = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;
  const containerBg = hasError ? 'bg-error-container/10' : 'bg-surface-container-low';

  return (
    <View>
      {label !== undefined && (
        <Text className="font-jakarta-bold text-xs text-on-surface-variant uppercase tracking-wider mb-1.5">
          {label}
        </Text>
      )}

      <View
        className={`flex-row h-13 ${containerBg} rounded-2xl px-4 items-center`}
        style={{ gap: 10 }}
      >
        {leftIcon !== undefined && (
          <Ionicons name={leftIcon} size={18} color={hasError ? '#b31b25' : '#5a5c5b'} />
        )}

        <TextInput
          {...props}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          placeholderTextColor="#acadac"
          className="flex-1 text-base font-jakarta text-on-surface"
        />

        {isPassword && (
          <Pressable onPress={() => setShowPassword((v) => !v)} className="pl-1">
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#5a5c5b"
            />
          </Pressable>
        )}
      </View>

      {hasError && (
        <Text className="font-jakarta text-xs text-error mt-1.5">{error}</Text>
      )}
    </View>
  );
}
