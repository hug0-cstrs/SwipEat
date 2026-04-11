import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MatchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center">
        <Text className="font-jakarta-extrabold text-2xl text-primary">🎉 Match !</Text>
        <Text className="font-jakarta text-sm text-on-surface-variant mt-2">Vous avez matché !</Text>
      </View>
    </SafeAreaView>
  );
}
