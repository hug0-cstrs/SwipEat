import { Image, Text, View } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
}

/** Dérive une couleur de fond stable depuis le nom */
function colorFromName(name: string): string {
  const palette = [
    '#ff7949', '#f8a010', '#22C55E', '#3b82f6',
    '#a855f7', '#ec4899', '#14b8a6', '#f97316',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const radius = size / 2;
  const fontSize = size * 0.38;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }

  const label = name ? initials(name) : '?';
  const bg = name ? colorFromName(name) : '#acadac';

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize,
          lineHeight: fontSize * 1.2,
          fontFamily: 'PlusJakartaSans_700Bold',
          color: '#ffffff',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
