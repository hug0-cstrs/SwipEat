import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useWishlist, useRemoveFromWishlist, type WishlistEntry } from '@/hooks/useWishlist';

// ── Carte wishlist (format grille 2 colonnes) ──────────────
function WishlistCard({ entry }: { entry: WishlistEntry }) {
  const removeMutation = useRemoveFromWishlist();
  const { dish } = entry;

  return (
    <View
      className="rounded-2xl overflow-hidden bg-surface-container-highest"
      style={{ height: 180 }}
    >
      {/* Image */}
      <Image
        source={{ uri: dish.image_url ?? undefined }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        resizeMode="cover"
      />

      {/* Gradient */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        locations={[0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Bouton retirer */}
      <Pressable
        onPress={() => removeMutation.mutate(dish.id)}
        disabled={removeMutation.isPending}
        className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center active:opacity-70"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      >
        {removeMutation.isPending ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Ionicons name="heart" size={16} color="#22C55E" />
        )}
      </Pressable>

      {/* Infos */}
      <View className="absolute bottom-0 left-0 right-0 px-3 pb-3">
        <Text
          className="font-jakarta-bold text-sm text-white"
          numberOfLines={2}
        >
          {dish.name}
        </Text>
        {dish.cuisine_type !== null && (
          <Text
            className="font-jakarta text-xs mt-0.5"
            style={{ color: 'rgba(255,255,255,0.65)' }}
            numberOfLines={1}
          >
            {dish.cuisine_type}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Écran principal ────────────────────────────────────────
export default function WishlistScreen() {
  const { data: entries, isLoading, isError, refetch } = useWishlist();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3">
        <Text className="font-jakarta-extrabold text-xl text-primary">Wishlist</Text>
        {entries !== undefined && entries.length > 0 && (
          <View className="bg-primary rounded-full px-3 py-0.5">
            <Text className="font-jakarta-bold text-xs text-on-primary">
              {entries.length} plat{entries.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* États */}
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#a63300" size="large" />
        </View>
      )}

      {isError && (
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ fontSize: 36 }}>⚠️</Text>
          <Text className="font-jakarta-bold text-base text-on-surface mt-3 text-center">
            Impossible de charger ta wishlist
          </Text>
          <Pressable onPress={() => void refetch()} className="mt-4 active:opacity-70">
            <Text className="font-jakarta-bold text-sm text-primary">Réessayer</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && entries?.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ fontSize: 48 }}>🤍</Text>
          <Text className="font-jakarta-extrabold text-xl text-on-surface mt-4 text-center">
            Ta wishlist est vide
          </Text>
          <Text className="font-jakarta text-sm text-on-surface-variant mt-2 text-center">
            Swipe à droite ou en haut sur les plats qui t'intéressent pour les retrouver ici.
          </Text>
        </View>
      )}

      {!isLoading && entries !== undefined && entries.length > 0 && (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.dish_id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => <View style={{ flex: 1 }}><WishlistCard entry={item} /></View>}
          showsVerticalScrollIndicator={false}
        />
      )}

    </SafeAreaView>
  );
}
