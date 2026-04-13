-- ─────────────────────────────────────────────────────────────────────────────
-- Correction de la politique sessions_update
--
-- Problème : seul le owner pouvait mettre à jour la session (status, match_dish_id).
-- Quand un non-owner clique "Continuer à swiper" après un match, useResumeSession
-- échoue silencieusement (RLS bloque, error = null, 0 lignes mises à jour).
-- La session reste status='matched' en DB → match-check retourne toujours
-- { match: false, reason: 'session already ended' } pour les swipes suivants.
--
-- Solution : permettre à n'importe quel participant de remettre une session
-- matchée en 'active'. Le owner conserve ses droits sur tous les statuts.
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "sessions_update" ON sessions;

-- Le owner peut tout mettre à jour.
-- Un participant peut remettre une session 'matched' en 'active' (Continuer à swiper).
CREATE POLICY "sessions_update" ON sessions
  FOR UPDATE USING (
    auth.uid() = owner_id
    OR (
      status = 'matched'
      AND id IN (
        SELECT session_id FROM session_participants WHERE user_id = auth.uid()
      )
    )
  );
