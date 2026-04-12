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

const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'Nom trop court (2 caractères min.)' }),
  email: z.email({ message: 'Adresse email invalide' }),
  password: z.string().min(6, { message: 'Au moins 6 caractères requis' }),
});

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async (values: { name: string; email: string; password: string }): Promise<void> => {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { name: values.name },
        },
      });
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
    const result = RegisterSchema.safeParse({ name, email, password });
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? 'Données invalides');
      return;
    }
    registerMutation.mutate(result.data);
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
          <View className="items-center pt-8 pb-2">
            <Text className="font-jakarta-extrabold text-xl text-primary">SwipEat</Text>
          </View>

          {/* ── Headings ────────────────────────────────────────────── */}
          <View className="px-6 mt-4 mb-8 items-center">
            <Text className="font-jakarta-extrabold text-4xl text-on-surface text-center">
              Créer mon compte
            </Text>
            <Text className="font-jakarta text-base text-on-surface-variant mt-1 text-center">
              Rejoins la communauté SwipEat
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
              ou avec ton email
            </Text>
            <View className="flex-1" style={{ height: 1, backgroundColor: '#acadac' }} />
          </View>

          {/* ── Form ────────────────────────────────────────────────── */}
          <View className="px-6 mb-6" style={{ gap: 16 }}>
            {/* Name */}
            <View>
              <Text className="font-jakarta-bold text-xs text-on-surface-variant uppercase tracking-wider mb-1.5">
                Prénom
              </Text>
              <View className="flex-row h-13 bg-surface-container-low rounded-2xl px-4 items-center" style={{ gap: 10 }}>
                <Ionicons name="person-outline" size={18} color="#5a5c5b" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ton prénom"
                  placeholderTextColor="#acadac"
                  autoCapitalize="words"
                  autoComplete="name"
                  className="flex-1 text-base font-jakarta text-on-surface"
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="font-jakarta-bold text-xs text-on-surface-variant uppercase tracking-wider mb-1.5">
                Email
              </Text>
              <View className="flex-row h-13 bg-surface-container-low rounded-2xl px-4 items-center" style={{ gap: 10 }}>
                <Ionicons name="mail-outline" size={18} color="#5a5c5b" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="exemple@email.com"
                  placeholderTextColor="#acadac"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  className="flex-1 text-base font-jakarta text-on-surface"
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="font-jakarta-bold text-xs text-on-surface-variant uppercase tracking-wider mb-1.5">
                Mot de passe
              </Text>
              <View className="flex-row h-13 bg-surface-container-low rounded-2xl px-4 items-center" style={{ gap: 10 }}>
                <Ionicons name="lock-closed-outline" size={18} color="#5a5c5b" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#acadac"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  className="flex-1 text-base font-jakarta text-on-surface"
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} className="pl-1">
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#5a5c5b"
                  />
                </Pressable>
              </View>
            </View>

            {/* Form error */}
            {formError !== null && (
              <Text className="font-jakarta text-sm text-error">{formError}</Text>
            )}
          </View>

          {/* ── CTA ─────────────────────────────────────────────────── */}
          <View className="px-6 mb-5">
            <Pressable
              onPress={handleSubmit}
              disabled={registerMutation.isPending}
              className="active:opacity-90"
            >
              <LinearGradient
                colors={['#a63300', '#ff7949']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 9999, height: 56, alignItems: 'center', justifyContent: 'center' }}
              >
                {registerMutation.isPending ? (
                  <ActivityIndicator color="#ffefeb" />
                ) : (
                  <Text className="font-jakarta-bold text-base text-on-primary">
                    Créer mon compte
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* ── Legal ───────────────────────────────────────────────── */}
          <View className="px-10 mb-6">
            <Text className="font-jakarta text-xs text-on-surface-variant text-center leading-5">
              En créant un compte, tu acceptes nos{' '}
              <Text
                className="font-jakarta-bold text-primary"
                onPress={() => Alert.alert('CGU', 'Conditions générales à venir.')}
              >
                CGU
              </Text>{' '}
              et notre{' '}
              <Text
                className="font-jakarta-bold text-primary"
                onPress={() => Alert.alert('Confidentialité', 'Politique de confidentialité à venir.')}
              >
                politique de confidentialité
              </Text>
              .
            </Text>
          </View>

          {/* ── Footer ──────────────────────────────────────────────── */}
          <View className="flex-row justify-center items-center">
            <Text className="font-jakarta text-sm text-on-surface-variant">Déjà inscrit ? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="font-jakarta-bold text-sm text-primary">Se connecter</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
