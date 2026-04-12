import { ActivityIndicator, Pressable, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

const sizeMap = {
  sm: { height: 40, label: 'text-sm' },
  md: { height: 52, label: 'text-sm' },
  lg: { height: 56, label: 'text-base' },
};

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const { height, label } = sizeMap[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} className="active:opacity-90">
        <LinearGradient
          colors={isDisabled ? ['#c97a5a', '#e8997a'] : ['#a63300', '#ff7949']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 9999, height, alignItems: 'center', justifyContent: 'center' }}
        >
          {loading ? (
            <ActivityIndicator color="#ffefeb" />
          ) : (
            <Text className={`font-jakarta-bold ${label} text-on-primary`}>{children}</Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`rounded-full items-center justify-center bg-on-surface active:opacity-75 ${isDisabled ? 'opacity-50' : ''}`}
        style={{ height }}
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
      className={`rounded-full items-center justify-center active:opacity-60 ${isDisabled ? 'opacity-40' : ''}`}
      style={{ height }}
    >
      {loading ? (
        <ActivityIndicator color="#a63300" />
      ) : (
        <Text className={`font-jakarta-bold ${label} text-primary`}>{children}</Text>
      )}
    </Pressable>
  );
}
