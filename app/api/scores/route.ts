import { NextResponse } from 'next/server';
import { getServerSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { score, chaosEventsSurvived = 0, playerId } = body;

    // Server-side validation
    if (typeof score !== 'number' || score < 0 || !Number.isInteger(score)) {
      return NextResponse.json({ error: 'Invalid score value' }, { status: 400 });
    }

    // Basic anti-cheat sanity check
    if (score > 1000) {
      return NextResponse.json({ error: 'Score exceeds human limits' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const serverSupabase = getServerSupabase();
      if (serverSupabase && playerId && !playerId.startsWith('guest_')) {
        // Record score in database
        const { error: scoreErr } = await serverSupabase.from('scores').insert({
          player_id: playerId,
          score,
          chaos_events_survived: chaosEventsSurvived,
        });

        if (scoreErr) {
          console.warn('Database error storing score', scoreErr);
        }

        // Fetch or update player stats
        const { data: currentStats } = await serverSupabase
          .from('player_stats')
          .select('best_score, total_games, total_score')
          .eq('player_id', playerId)
          .single();

        const currentBest = currentStats?.best_score || 0;
        const totalGames = (currentStats?.total_games || 0) + 1;
        const totalScore = (currentStats?.total_score || 0) + score;
        const newBest = Math.max(currentBest, score);

        await serverSupabase.from('player_stats').upsert({
          player_id: playerId,
          best_score: newBest,
          total_games: totalGames,
          total_score: totalScore,
          updated_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      score,
      verified: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
