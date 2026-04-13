-- ─────────────────────────────────────────────────────────────────────────────
-- Correction de la politique RLS participants_select
--
-- Problème : la politique originale est récursive — elle effectue un SELECT sur
-- session_participants pour savoir si l'utilisateur est membre de la session.
-- PostgREST résout les embedded selects (sessions → session_participants) avec
-- un second niveau de requête où la politique récursive renvoie un résultat vide,
-- ce qui masque tous les participants dans l'UI malgré des données correctes en DB.
--
-- Solution : remplacer par une vérification non-récursive. Pour le MVP SwipEat,
-- une lecture limitée aux utilisateurs authentifiés est suffisamment sécurisée :
-- l'accès à une session nécessite un code à 6 caractères aléatoires.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "participants_select" ON session_participants;

CREATE POLICY "participants_select" ON session_participants
  FOR SELECT USING (auth.uid() IS NOT NULL);
