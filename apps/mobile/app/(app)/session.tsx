import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SessionScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <View className="flex-1 items-center justify-center">
        <Text className="font-jakarta-extrabold text-2xl text-on-surface">Session</Text>
        <Text className="font-jakarta text-sm text-on-surface-variant mt-2">Bientôt disponible</Text>
      </View>
    </SafeAreaView>
  );
}
