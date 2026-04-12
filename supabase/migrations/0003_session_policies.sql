-- Sessions : tout utilisateur authentifié peut lire (nécessaire pour rejoindre par code)
CREATE POLICY "sessions_select" ON sessions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Sessions : seul le owner peut créer
CREATE POLICY "sessions_insert" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Sessions : seul le owner peut mettre à jour (statut, match_dish_id)
CREATE POLICY "sessions_update" ON sessions
  FOR UPDATE USING (auth.uid() = owner_id);

-- Participants : lecture limitée aux membres de la session
CREATE POLICY "participants_select" ON session_participants
  FOR SELECT USING (
    session_id IN (
      SELECT session_id FROM session_participants WHERE user_id = auth.uid()
    )
  );

-- Participants : un utilisateur peut rejoindre (insérer son propre user_id)
CREATE POLICY "participants_insert" ON session_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Participants : un utilisateur peut quitter (supprimer sa propre ligne)
CREATE POLICY "participants_delete" ON session_participants
  FOR DELETE USING (auth.uid() = user_id);
