import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';

const LoginSchema = z.object({
  email: z.email({ message: 'Adresse email invalide' }),
  password: z.string().min(6, { message: 'Au moins 6 caractères requis' }),
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async (values: { email: string; password: string }): Promise<void> => {
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      router.replace('/(app)');
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  function handleSubmit(): void {
    setFormError(null);
    const result = LoginSchema.safeParse({ email, password });
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Données invalides');
      return;
    }
    loginMutation.mutate(result.data);
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <View className="flex-row items-start justify-between px-6 pt-4 overflow-hidden">
            <Text className="font-jakarta-extrabold text-xl text-primary">SwipEat</Text>
            {/* Citrus decoration — partially off-screen top-right */}
            <View
              className="w-28 h-28 rounded-full bg-tertiary-container items-center justify-center overflow-hidden"
              style={{ transform: [{ translateX: 28 }, { translateY: -18 }] }}
            >
              <Text style={{ fontSize: 60, lineHeight: 72, marginLeft: 6 }}>🍋</Text>
            </View>
          </View>

          {/* ── Headings ────────────────────────────────────────────── */}
          <View className="px-6 mt-1 mb-8">
            <Text className="font-jakarta-extrabold text-4xl text-on-surface">
              Bon retour !
            </Text>
            <Text className="font-jakarta text-base text-on-surface-variant mt-1">
              Content de te revoir
            </Text>
          </View>

          {/* ── Social buttons ──────────────────────────────────────── */}
          <View className="px-6 mb-6" style={{ gap: 12 }}>
            <Pressable
              onPress={() =>
                Alert.alert('Bientôt disponible', 'La connexion Google sera disponible prochainement.')
              }
              className="flex-row items-center justify-center h-13 rounded-full bg-surface-container-lowest border border-outline-variant active:opacity-75"
              style={{ gap: 10 }}
            >
              <AntDesign name="google" size={18} color="#4285F4" />
              <Text className="font-jakarta-semibold text-sm text-on-surface">
                Continuer avec Google
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                Alert.alert('Bientôt disponible', 'La connexion Apple sera disponible prochainement.')
              }
              className="flex-row items-center justify-center h-13 rounded-full bg-on-surface active:opacity-75"
              style={{ gap: 10 }}
            >
              <Ionicons name="logo-apple" size={18} color="#ffffff" />
              <Text className="font-jakarta-semibold text-sm text-surface-container-lowest">
                Continuer avec Apple
              </Text>
            </Pressable>
          </View>

          {/* ── Divider ─────────────────────────────────────────────── */}
          <View className="flex-row items-center px-6 mb-6" style={{ gap: 12 }}>
            <View className="flex-1" style={{ height: 1, backgroundColor: '#acadac' }} />
            <Text className="font-jakarta-semibold text-xs text-on-surface-variant uppercase tracking-widest">
              ou par email
            </Text>
            <View className="flex-1" style={{ height: 1, backgroundColor: '#acadac' }} />
          </View>

          {/* ── Form ────────────────────────────────────────────────── */}
          <View className="px-6 mb-6">
            {/* Email */}
            <Text className="font-jakarta-bold text-xs text-on-surface-variant uppercase tracking-wider mb-1.5">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="exemple@email.com"
              placeholderTextColor="#acadac"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="h-13 bg-surface-container-low rounded-2xl px-4 text-base font-jakarta text-on-surface mb-5"
            />

            {/* Password row label */}
            <View className="flex-row justify-between items-center mb-1.5">
              <Text className="font-jakarta-bold text-xs text-on-surface-variant uppercase tracking-wider">
                Mot de passe
              </Text>
              <Pressable>
                <Text className="font-jakarta-bold text-xs text-primary uppercase tracking-wider">
                  Mot de passe oublié ?
                </Text>
              </Pressable>
            </View>
            {/* Password input */}
            <View
              className="flex-row h-13 bg-surface-container-low rounded-2xl px-4 items-center"
            >
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#acadac"
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                className="flex-1 text-base font-jakarta text-on-surface"
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} className="pl-2">
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#5a5c5b"
                />
              </Pressable>
            </View>

            {/* Form error */}
            {formError !== null && (
              <Text className="font-jakarta text-sm text-error mt-3">{formError}</Text>
            )}
          </View>

          {/* ── CTA ─────────────────────────────────────────────────── */}
          <View className="px-6 mb-8">
            <Pressable
              onPress={handleSubmit}
              disabled={loginMutation.isPending}
              className="active:opacity-90"
            >
              <LinearGradient
                colors={['#a63300', '#ff7949']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 9999, height: 56, alignItems: 'center', justifyContent: 'center' }}
              >
                {loginMutation.isPending ? (
                  <ActivityIndicator color="#ffefeb" />
                ) : (
                  <Text className="font-jakarta-bold text-base text-on-primary">
                    Se connecter
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <View className="flex-row justify-center items-center">
            <Text className="font-jakarta text-sm text-on-surface-variant">Pas de compte ? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="font-jakarta-bold text-sm text-primary">Créer le mien</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
