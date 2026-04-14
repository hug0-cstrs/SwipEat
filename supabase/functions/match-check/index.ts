import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { session_id, dish_id } = await req.json() as { session_id: string; dish_id: string };

    if (!session_id || !dish_id) {
      return new Response(
        JSON.stringify({ error: 'session_id and dish_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Récupérer la session (vérifier qu'elle est active)
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, status, max_participants')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Session fermée définitivement : pas besoin de vérifier
    // Note : on autorise délibérément le statut 'matched' pour permettre
    // plusieurs matchs consécutifs dans la même session (après "Continuer à swiper").
    if (session.status === 'closed') {
      return new Response(
        JSON.stringify({ match: false, reason: 'session closed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Compter les participants actuels de la session
    const { count: participantCount, error: participantError } = await supabase
      .from('session_participants')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id);

    if (participantError) throw new Error(participantError.message);

    // Pas encore de partenaire : impossible de matcher seul
    if ((participantCount ?? 0) < 2) {
      return new Response(
        JSON.stringify({ match: false, reason: 'waiting for partner' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Compter les swipes positifs (right ou up) pour ce plat dans cette session
    const { count: positiveSwipeCount, error: swipeError } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id)
      .eq('dish_id', dish_id)
      .in('direction', ['right', 'up']);

    if (swipeError) throw new Error(swipeError.message);

    // Match si tous les participants ont aimé ce plat
    const isMatch = (positiveSwipeCount ?? 0) >= (participantCount ?? 0) && (participantCount ?? 0) > 0;

    if (!isMatch) {
      return new Response(
        JSON.stringify({ match: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Récupérer les détails du plat matché
    const { data: dish, error: dishError } = await supabase
      .from('dishes')
      .select('*')
      .eq('id', dish_id)
      .single();

    if (dishError || !dish) throw new Error('Plat introuvable');

    const matchedAt = new Date().toISOString();

    // Mettre à jour la session : status → 'matched', match_dish_id, matched_at
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        status: 'matched',
        match_dish_id: dish_id,
        matched_at: matchedAt,
      })
      .eq('id', session_id);

    if (updateError) throw new Error(updateError.message);

    // Historiser le match dans session_matches (tous les matchs, pas seulement le dernier)
    const { error: matchInsertError } = await supabase
      .from('session_matches')
      .insert({ session_id, dish_id, matched_at: matchedAt });

    if (matchInsertError) {
      // Non-bloquant : la session est déjà mise à jour, le realtime a été déclenché.
      // On log sans faire échouer la réponse.
      console.error('[match-check] session_matches insert failed:', matchInsertError.message);
    }

    // La notification des clients se fait automatiquement via postgres_changes
    // (Realtime DB sur la table sessions). Plus fiable que le broadcast WebSocket
    // depuis une Edge Function (connexion WS trop courte pour le cycle Deno).

    return new Response(
      JSON.stringify({ match: true, dish }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
