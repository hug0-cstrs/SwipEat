import { Image, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

import type { Database } from '@swipeat/types';
import { Badge } from '@/components/ui/Badge';

const StyledGradient = cssInterop(LinearGradient, { className: 'style' });

type Dish = Database['public']['Tables']['dishes']['Row'];

interface DishCardProps {
  dish: Dish;
}

function DifficultyDot({ difficulty }: { difficulty: string | null }) {
  const levels: Record<string, number> = { facile: 1, moyen: 2, difficile: 3 };
  const filled = levels[difficulty ?? ''] ?? 0;
  return (
    <View className="flex-row" style={{ gap: 3 }}>
      {[1, 2, 3].map((n) => (
        <View
          key={n}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: n <= filled ? '#ff7949' : 'rgba(255,255,255,0.35)',
          }}
        />
      ))}
    </View>
  );
}

export function DishCard({ dish }: DishCardProps) {
  return (
    <View className="flex-1 rounded-3xl overflow-hidden bg-surface-container-highest">
      {/* ── Photo ──────────────────────────────────────────── */}
      <Image
        source={{ uri: dish.image_url }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      {/* ── Gradient overlay ───────────────────────────────── */}
      <StyledGradient
        colors={['transparent', 'rgba(0,0,0,0.18)', 'rgba(0,0,0,0.72)', 'rgba(0,0,0,0.88)']}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute inset-0"
      />

      {/* ── Content ─────────────────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-7">

        {/* Badges */}
        <View className="flex-row flex-wrap mb-3" style={{ gap: 6 }}>
          <Badge label={dish.cuisine_type} variant="cuisine" />
          {dish.is_vegan && <Badge label="Vegan" variant="dietary" />}
          {dish.is_gluten_free && <Badge label="Sans gluten" variant="dietary" />}
        </View>

        {/* Name */}
        <Text
          className="font-jakarta-extrabold text-3xl text-white mb-1"
          numberOfLines={2}
        >
          {dish.name}
        </Text>

        {/* Description */}
        {dish.description !== null && (
          <Text
            className="font-jakarta text-sm mb-4"
            style={{ color: 'rgba(255,255,255,0.75)' }}
            numberOfLines={2}
          >
            {dish.description}
          </Text>
        )}

        {/* Metadata row */}
        <View className="flex-row items-center" style={{ gap: 16 }}>
          {dish.prep_time !== null && (
            <View className="flex-row items-center" style={{ gap: 5 }}>
              <Ionicons name="time-outline" size={15} color="rgba(255,255,255,0.8)" />
              <Text className="font-jakarta-semibold text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {dish.prep_time} min
              </Text>
            </View>
          )}

          {dish.calories !== null && (
            <View className="flex-row items-center" style={{ gap: 5 }}>
              <Ionicons name="flame-outline" size={15} color="rgba(255,255,255,0.8)" />
              <Text className="font-jakarta-semibold text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {dish.calories} kcal
              </Text>
            </View>
          )}

          {dish.difficulty !== null && (
            <View className="flex-row items-center" style={{ gap: 6 }}>
              <DifficultyDot difficulty={dish.difficulty} />
              <Text className="font-jakarta-semibold text-xs capitalize" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {dish.difficulty}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
