import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-brand-500">SwipEat</Text>
      <Text className="text-base text-gray-500 mt-2">Le swipe du dîner commence ici</Text>
    </View>
  );
}
