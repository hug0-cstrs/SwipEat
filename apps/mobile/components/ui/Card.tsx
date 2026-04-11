import { Pressable, View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  /** Padding interne — défaut true */
  padded?: boolean;
  className?: string;
}

export function Card({ children, onPress, padded = true, className = '' }: CardProps) {
  const base = `bg-surface-container-lowest rounded-3xl overflow-hidden ${padded ? 'p-4' : ''} ${className}`;

  if (onPress !== undefined) {
    return (
      <Pressable onPress={onPress} className={`${base} active:opacity-90`}>
        {children}
      </Pressable>
    );
  }

  return <View className={base}>{children}</View>;
}
