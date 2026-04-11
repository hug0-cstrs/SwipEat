import { ActivityIndicator, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

const StyledGradient = cssInterop(LinearGradient, { className: 'style' });

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

const sizeClasses = {
  sm: { container: 'h-10', label: 'text-sm' },
  md: { container: 'h-13', label: 'text-sm' },
  lg: { container: 'h-14', label: 'text-base' },
};

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const { container, label } = sizeClasses[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} className="active:opacity-90">
        <StyledGradient
          colors={isDisabled ? ['#c97a5a', '#e8997a'] : ['#a63300', '#ff7949']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`rounded-full ${container} items-center justify-center`}
        >
          {loading ? (
            <ActivityIndicator color="#ffefeb" />
          ) : (
            <Text className={`font-jakarta-bold ${label} text-on-primary`}>{children}</Text>
          )}
        </StyledGradient>
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`rounded-full ${container} items-center justify-center bg-on-surface active:opacity-75 ${isDisabled ? 'opacity-50' : ''}`}
      >
        {loading ? (
          <ActivityIndicator color="#f6f6f5" />
        ) : (
          <Text className={`font-jakarta-bold ${label} text-surface-container-lowest`}>
            {children}
          </Text>
        )}
      </Pressable>
    );
  }

  // ghost
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-full ${container} items-center justify-center active:opacity-60 ${isDisabled ? 'opacity-40' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color="#a63300" />
      ) : (
        <Text className={`font-jakarta-bold ${label} text-primary`}>{children}</Text>
      )}
    </Pressable>
  );
}
