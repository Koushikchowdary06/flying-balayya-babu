import { LeaderboardEntry } from './types';
import { isSupabaseConfigured, supabase } from './supabase';
import { getStoredProfile } from './storage';

const INITIAL_MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    playerId: 'hero_balayya',
    username: 'Balayya Babu (God of Masses) 👑',
    avatarUrl: '/assets/default-character.png',
    bestScore: 248,
    totalGames: 420,
    scoreDate: '2026-10-31T14:30:00.000Z',
  },
  {
    rank: 2,
    playerId: 'p2',
    username: 'CyberFlapper99',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberFlapper99',
    bestScore: 195,
    totalGames: 312,
    scoreDate: '2026-10-31T11:20:00.000Z',
  },
  {
    rank: 3,
    playerId: 'p3',
    username: 'NeonValkyrie',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonValkyrie',
    bestScore: 164,
    totalGames: 280,
    scoreDate: '2026-10-30T18:15:00.000Z',
  },
  {
    rank: 4,
    playerId: 'p4',
    username: 'ChaosNinja',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ChaosNinja',
    bestScore: 132,
    totalGames: 195,
    scoreDate: '2026-10-30T09:40:00.000Z',
  },
  {
    rank: 5,
    playerId: 'p5',
    username: 'QuantumPixel',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuantumPixel',
    bestScore: 98,
    totalGames: 140,
    scoreDate: '2026-10-29T20:10:00.000Z',
  },
  {
    rank: 6,
    playerId: 'p6',
    username: 'ApexFalcon',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ApexFalcon',
    bestScore: 74,
    totalGames: 95,
    scoreDate: '2026-10-29T15:25:00.000Z',
  },
  {
    rank: 7,
    playerId: 'p7',
    username: 'VortexPilot',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=VortexPilot',
    bestScore: 52,
    totalGames: 82,
    scoreDate: '2026-10-28T12:00:00.000Z',
  },
  {
    rank: 8,
    playerId: 'p8',
    username: 'RetroGlitch',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=RetroGlitch',
    bestScore: 38,
    totalGames: 60,
    scoreDate: '2026-10-27T08:30:00.000Z',
  },
];

function getLocalLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_LEADERBOARD;
  const stored = localStorage.getItem('fc_global_leaderboard');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  localStorage.setItem('fc_global_leaderboard', JSON.stringify(INITIAL_MOCK_LEADERBOARD));
  return INITIAL_MOCK_LEADERBOARD;
}

function saveLocalLeaderboard(entries: LeaderboardEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fc_global_leaderboard', JSON.stringify(entries));
}

export async function fetchLeaderboard(
  timeframe: 'all-time' | 'weekly' | 'today' = 'all-time'
): Promise<LeaderboardEntry[]> {
  const currentProfile = getStoredProfile();

  if (isSupabaseConfigured && supabase) {
    try {
      let rpcName = 'get_leaderboard_all_time';
      if (timeframe === 'weekly') rpcName = 'get_leaderboard_weekly';
      if (timeframe === 'today') rpcName = 'get_leaderboard_daily';

      const { data, error } = await supabase.rpc(rpcName, { limit_count: 50 });
      if (!error && data && Array.isArray(data)) {
        return data.map((item: { rank: number; player_id: string; username: string; avatar_url: string; best_score: number; total_games?: number; score_date?: string }, index: number) => ({
          rank: item.rank || index + 1,
          playerId: item.player_id,
          username: item.username,
          avatarUrl: item.avatar_url || '/assets/default-character.png',
          bestScore: item.best_score,
          totalGames: item.total_games,
          scoreDate: item.score_date,
          isCurrentPlayer: item.player_id === currentProfile.id,
        }));
      }
    } catch (e) {
      console.warn('Supabase query failed, falling back to local leaderboard', e);
    }
  }

  // Local / Simulated Competitive Fallback
  let entries = [...getLocalLeaderboard()];

  // Ensure current player is included if they have played
  if (currentProfile.bestScore > 0) {
    const existingIdx = entries.findIndex((e) => e.playerId === currentProfile.id);
    const entry: LeaderboardEntry = {
      rank: 0,
      playerId: currentProfile.id,
      username: currentProfile.username,
      avatarUrl: currentProfile.avatarUrl,
      bestScore: currentProfile.bestScore,
      totalGames: currentProfile.totalGames,
      scoreDate: new Date().toISOString(),
      isCurrentPlayer: true,
    };
    if (existingIdx >= 0) {
      entries[existingIdx] = entry;
    } else {
      entries.push(entry);
    }
  }

  // Sort descending by score
  entries.sort((a, b) => b.bestScore - a.bestScore);

  // Filter for weekly or today in local mode
  const now = Date.now();
  if (timeframe === 'today') {
    entries = entries.filter((e) => {
      if (e.playerId === currentProfile.id) return true;
      const d = e.scoreDate ? new Date(e.scoreDate).getTime() : now;
      return now - d < 86400000;
    });
  } else if (timeframe === 'weekly') {
    entries = entries.filter((e) => {
      if (e.playerId === currentProfile.id) return true;
      const d = e.scoreDate ? new Date(e.scoreDate).getTime() : now;
      return now - d < 7 * 86400000;
    });
  }

  // Assign ranks
  return entries.map((e, idx) => ({
    ...e,
    rank: idx + 1,
    isCurrentPlayer: e.playerId === currentProfile.id,
  }));
}

export async function submitScoreToDatabase(score: number, chaosEventsSurvived: number): Promise<{
  globalRank: number;
  dailyRank: number;
  weeklyRank: number;
  isNewBest: boolean;
}> {
  const currentProfile = getStoredProfile();
  const isNewBest = score > currentProfile.bestScore;

  // Update local profile stats
  currentProfile.totalGames += 1;
  currentProfile.totalScore += score;
  if (isNewBest) {
    currentProfile.bestScore = score;
  }
  localStorage.setItem('fc_player_profile', JSON.stringify(currentProfile));

  // Update local leaderboard
  const entries = getLocalLeaderboard();
  const existingIdx = entries.findIndex((e) => e.playerId === currentProfile.id);
  const updatedEntry: LeaderboardEntry = {
    rank: 0,
    playerId: currentProfile.id,
    username: currentProfile.username,
    avatarUrl: currentProfile.avatarUrl,
    bestScore: currentProfile.bestScore,
    totalGames: currentProfile.totalGames,
    scoreDate: new Date().toISOString(),
    isCurrentPlayer: true,
  };

  if (existingIdx >= 0) {
    entries[existingIdx] = updatedEntry;
  } else {
    entries.push(updatedEntry);
  }
  entries.sort((a, b) => b.bestScore - a.bestScore);
  saveLocalLeaderboard(entries);

  // If Supabase is active and player is authenticated, submit to database
  if (isSupabaseConfigured && supabase && !currentProfile.isGuest) {
    try {
      await supabase.from('scores').insert({
        player_id: currentProfile.id,
        score,
        chaos_events_survived: chaosEventsSurvived,
      });

      await supabase.from('player_stats').upsert({
        player_id: currentProfile.id,
        best_score: currentProfile.bestScore,
        total_games: currentProfile.totalGames,
        total_score: currentProfile.totalScore,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase score submission error', e);
    }
  }

  // Calculate ranks
  const sorted = [...entries].sort((a, b) => b.bestScore - a.bestScore);
  const globalRank = sorted.findIndex((e) => e.playerId === currentProfile.id) + 1 || 1;
  const dailyRank = Math.max(1, Math.min(globalRank, 15));
  const weeklyRank = Math.max(1, Math.min(globalRank, 25));

  return {
    globalRank,
    dailyRank,
    weeklyRank,
    isNewBest,
  };
}
