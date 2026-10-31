'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Search, User, Sparkles } from 'lucide-react';
import { LeaderboardEntry, PlayerProfile } from '@/lib/types';
import { fetchLeaderboard } from '@/lib/leaderboard';
import { getStoredProfile } from '@/lib/storage';

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<'all-time' | 'weekly' | 'today'>('all-time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    setProfile(getStoredProfile());
    loadData(timeframe);
  }, [timeframe]);

  const loadData = async (tf: 'all-time' | 'weekly' | 'today') => {
    setLoading(true);
    try {
      const data = await fetchLeaderboard(tf);
      setEntries(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filtered = entries.filter((e) =>
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  const currentPlayerEntry = entries.find((e) => e.isCurrentPlayer);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-black tracking-widest text-amber-400">
          <Trophy className="h-4 w-4" />
          GLOBAL HALL OF FAME
        </div>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-wider text-white sm:text-4xl">
          ARCADE LEADERBOARD
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Compete against players worldwide. Climb ranks and claim the golden crown!
        </p>
      </div>

      {/* Current Player Status Card */}
      {profile && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={profile.avatarUrl || '/assets/default-character.png'}
                alt={profile.username}
                className="h-12 w-12 rounded-xl object-cover ring-2 ring-amber-400"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white">{profile.username}</span>
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    YOU
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Best Score: <strong className="text-amber-400 font-mono text-sm">{profile.bestScore}</strong> | Total Games: {profile.totalGames}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                CURRENT RANK
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                #{currentPlayerEntry?.rank || '-'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Timeframe Tabs */}
        <div className="flex items-center rounded-2xl border border-white/10 bg-zinc-900/80 p-1">
          {(
            [
              { id: 'all-time', label: 'All Time' },
              { id: 'weekly', label: 'This Week' },
              { id: 'today', label: 'Today' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                timeframe === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search pilot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
            <Sparkles className="h-8 w-8 animate-spin text-amber-400" />
            <p className="mt-2 text-xs font-semibold">Loading global scores...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <p className="text-sm">No pilots found matching &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((entry) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;

              return (
                <div
                  key={`${entry.playerId}-${entry.rank}`}
                  className={`flex items-center justify-between px-4 py-3.5 sm:px-6 transition ${
                    entry.isCurrentPlayer
                      ? 'bg-amber-500/10 border-l-4 border-amber-400'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Rank Badge */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center font-black">
                      {isFirst ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400 shadow-lg shadow-amber-400/20">
                          <Crown className="h-5 w-5 fill-amber-400" />
                        </div>
                      ) : isSecond ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-300/20 text-slate-300">
                          <Medal className="h-5 w-5 fill-slate-300" />
                        </div>
                      ) : isThird ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-700/20 text-amber-600">
                          <Medal className="h-5 w-5 fill-amber-600" />
                        </div>
                      ) : (
                        <span className="font-mono text-sm text-zinc-400">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <img
                      src={entry.avatarUrl || '/assets/default-character.png'}
                      alt={entry.username}
                      className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10"
                    />

                    {/* Name */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white max-w-[140px] sm:max-w-[200px] truncate">
                          {entry.username}
                        </span>
                        {entry.isCurrentPlayer && (
                          <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {entry.totalGames ? `${entry.totalGames} games played` : 'Verified Flight'}
                      </p>
                    </div>
                  </div>

                  {/* Best Score */}
                  <div className="text-right">
                    <span className="font-mono text-2xl font-black text-amber-400 sm:text-3xl drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                      {entry.bestScore}
                    </span>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      POINTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
