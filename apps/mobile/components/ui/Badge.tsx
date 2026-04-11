import { Text, View } from 'react-native';

type BadgeVariant = 'cuisine' | 'dietary' | 'difficulty' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  cuisine: {
    container: 'bg-primary/10 rounded-full px-3 py-1',
    text: 'font-jakarta-semibold text-xs text-primary',
  },
  dietary: {
    container: 'bg-like/10 rounded-full px-3 py-1',
    text: 'font-jakarta-semibold text-xs text-like',
  },
  difficulty: {
    container: 'bg-surface-container-high rounded-full px-3 py-1',
    text: 'font-jakarta-semibold text-xs text-on-surface-variant',
  },
  default: {
    container: 'bg-surface-container-high rounded-full px-3 py-1',
    text: 'font-jakarta-semibold text-xs text-on-surface-variant',
  },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const { container, text } = variantStyles[variant];
  return (
    <View className={container}>
      <Text className={text}>{label}</Text>
    </View>
  );
}
