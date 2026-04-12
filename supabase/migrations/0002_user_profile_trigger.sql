-- Active RLS sur la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Lecture publique des profils (nécessaire pour les sessions)
CREATE POLICY "profiles_public_read" ON public.users
  FOR SELECT USING (true);

-- Un utilisateur ne peut modifier que son propre profil
CREATE POLICY "own_profile_write" ON public.users
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fonction déclenchée à chaque nouvel utilisateur auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
