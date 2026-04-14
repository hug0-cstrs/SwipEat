-- 0007_session_matches.sql
-- Table pour historiser TOUS les matchs d'une session
-- (sessions.match_dish_id ne stocke que le dernier match)

CREATE TABLE IF NOT EXISTS session_matches (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID        NOT NULL REFERENCES sessions(id)  ON DELETE CASCADE,
  dish_id    UUID        NOT NULL REFERENCES dishes(id)    ON DELETE CASCADE,
  matched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les lookups par session (et tri temporel)
CREATE INDEX idx_session_matches_session_id ON session_matches(session_id);
CREATE INDEX idx_session_matches_matched_at ON session_matches(matched_at DESC);

-- RLS ─────────────────────────────────────────────────────────────────────────
ALTER TABLE session_matches ENABLE ROW LEVEL SECURITY;

-- Les participants d'une session peuvent lire ses matchs
CREATE POLICY "session_matches_select_for_participants"
  ON session_matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_participants sp
      WHERE sp.session_id = session_matches.session_id
        AND sp.user_id = auth.uid()
    )
  );

-- L'insertion est réservée au service role (Edge Function match-check)
-- Aucune politique INSERT/UPDATE/DELETE côté client n'est nécessaire.
