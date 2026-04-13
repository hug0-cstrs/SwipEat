-- ─────────────────────────────────────────────────────────────────────────────
-- Activation du Realtime pour la détection de match et des changements de session
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Activer RLS sur session_participants (manquant dans la migration initiale)
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- 2. Ajouter sessions et session_participants à la publication Realtime
--    (idempotent : on vérifie que la publication n'est pas déjà FOR ALL TABLES)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication
    WHERE pubname = 'supabase_realtime' AND puballtables = true
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'sessions'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = 'session_participants'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE session_participants;
    END IF;
  END IF;
END $$;

-- 3. Trigger : passer la session en 'active' automatiquement quand le 2ème participant
--    rejoint. SECURITY DEFINER pour contourner la RLS (seul le owner peut UPDATE sessions).
CREATE OR REPLACE FUNCTION handle_session_participant_joined()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) FROM session_participants WHERE session_id = NEW.session_id
  ) >= 2 THEN
    UPDATE sessions
    SET status = 'active'
    WHERE id = NEW.session_id AND status = 'waiting';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_participant_joined ON session_participants;
CREATE TRIGGER on_participant_joined
  AFTER INSERT ON session_participants
  FOR EACH ROW EXECUTE FUNCTION handle_session_participant_joined();
