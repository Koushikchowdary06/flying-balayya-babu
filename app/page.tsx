'use client';

import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import {
  Gamepad2,
  Trophy,
  Palette,
  User,
  Settings as SettingsIcon,
  Flame,
  Crown,
  Medal,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { LeaderboardEntry, PlayerProfile } from '@/lib/types';
import { fetchLeaderboard } from '@/lib/leaderboard';
import { getStoredProfile, getUnlockedAchievements } from '@/lib/storage';
import { CHAOS_EVENT_DEFINITIONS } from '@/lib/constants';

export default function HomePage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [topThree, setTopThree] = useState<LeaderboardEntry[]>([]);
  const [totalPlayers, setTotalPlayers] = useState<number>(1420);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);

  useEffect(() => {
    const p = getStoredProfile();
    setProfile(p);
    setUnlockedCount(getUnlockedAchievements().filter((a) => !!a.unlockedAt).length);

    fetchLeaderboard('all-time').then((entries) => {
      setTopThree(entries.slice(0, 3));
      setTotalPlayers(Math.max(1420, entries.length * 150));
    });
  }, []);

  const chaosList = Object.entries(CHAOS_EVENT_DEFINITIONS);

  return (
    <div className="relative overflow-hidden bg-zinc-950 pb-20">
      {/* Background Neon Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-rose-600/20 via-amber-500/20 to-purple-600/20 blur-[130px]" />

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:pt-16">
        {/* HERO SECTION */}
        <div className="flex flex-col items-center text-center">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-zinc-900/80 px-4 py-2 shadow-lg shadow-amber-500/10 backdrop-blur-xl">
            <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
              JAI BALAYYA! ARCADE EDITION
            </span>
          </div>

          {/* Main Title */}
          <h1 className="mt-6 font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-500 text-5xl sm:text-7xl lg:text-8xl drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]">
            FLYING BALAYYA BABU
          </h1>

          {/* Tagline */}
          <p className="mt-3 text-lg sm:text-2xl font-black tracking-widest text-zinc-200">
            “ONE TAP. INFINITE CHAOS.”
          </p>

          <p className="mt-4 max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed">
            The ultimate mass arcade sensation! Fly as Nandamuri Balakrishna (God of Masses), dodge unpredictable neon obstacles, survive 10 wild chaos mutations, groove to Telugu beats, and dominate the world leaderboard!
          </p>

          {/* Character Spotlight Preview */}
          <div className="relative mt-8 flex flex-col items-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-3xl border-2 border-amber-400/80 bg-zinc-900/90 p-2 shadow-2xl shadow-amber-500/30 animate-bounce">
              <img
                src={profile?.avatarUrl || '/assets/default-character.png'}
                alt="Flappy Hero"
                className="h-full w-full rounded-2xl object-cover"
              />
              <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 font-bold text-white shadow-lg">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <span className="mt-3 text-xs font-black tracking-wider text-amber-400 uppercase">
              ACTIVE HERO: {profile?.username || 'BALAYYA'}
            </span>
          </div>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <NextLink
              href="/play"
              className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-fuchsia-600 px-8 py-4 text-lg font-black text-white shadow-2xl shadow-rose-600/40 transition hover:scale-105 active:scale-95"
            >
              <Gamepad2 className="h-6 w-6" />
              PLAY NOW
              <ArrowRight className="h-5 w-5" />
            </NextLink>

            <NextLink
              href="/customize"
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-6 py-4 text-base font-bold text-zinc-200 backdrop-blur-md transition hover:bg-zinc-800 hover:text-white active:scale-95"
            >
              <Palette className="h-5 w-5 text-amber-400" />
              CUSTOMIZE
            </NextLink>

            <NextLink
              href="/leaderboard"
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/80 px-6 py-4 text-base font-bold text-zinc-200 backdrop-blur-md transition hover:bg-zinc-800 hover:text-white active:scale-95"
            >
              <Trophy className="h-5 w-5 text-rose-400" />
              LEADERBOARD
            </NextLink>
          </div>

          {/* Secondary Quick Links */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-zinc-400">
            <NextLink href="/profile" className="flex items-center gap-1.5 hover:text-amber-400 transition">
              <User className="h-3.5 w-3.5" />
              Player Profile
            </NextLink>
            <span>•</span>
            <NextLink href="/settings" className="flex items-center gap-1.5 hover:text-amber-400 transition">
              <SettingsIcon className="h-3.5 w-3.5" />
              Game Settings
            </NextLink>
          </div>
        </div>

        {/* STATS BANNER */}
        <div className="mt-14 grid grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-xl sm:grid-cols-4">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">YOUR BEST SCORE</span>
            <div className="mt-1 font-mono text-3xl font-black text-amber-400">
              {profile?.bestScore || 0}
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">TOTAL FLIGHTS</span>
            <div className="mt-1 font-mono text-3xl font-black text-rose-400">
              {profile?.totalGames || 0}
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">GLOBAL PLAYERS</span>
            <div className="mt-1 font-mono text-3xl font-black text-sky-400">
              {totalPlayers.toLocaleString()}+
            </div>
          </div>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">BADGES UNLOCKED</span>
            <div className="mt-1 font-mono text-3xl font-black text-emerald-400">
              {unlockedCount} / 9
            </div>
          </div>
        </div>

        {/* TOP 3 GLOBAL PODIUM */}
        <div className="mt-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-black tracking-widest text-amber-400">
              <Crown className="h-3.5 w-3.5" />
              CURRENT WORLD CHAMPIONS
            </div>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-wider text-white sm:text-3xl">
              GLOBAL TOP THREE
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {topThree.map((player, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;

              return (
                <div
                  key={player.playerId}
                  className={`relative flex flex-col items-center rounded-3xl border p-6 text-center transition ${
                    isFirst
                      ? 'border-amber-400/60 bg-gradient-to-b from-amber-500/20 to-zinc-950 shadow-xl shadow-amber-500/20 sm:-translate-y-3'
                      : isSecond
                      ? 'border-slate-400/40 bg-zinc-900/60 shadow-lg'
                      : 'border-amber-700/40 bg-zinc-900/60 shadow-lg'
                  }`}
                >
                  <div className="relative mb-3 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/20 bg-zinc-950 p-1">
                    <img
                      src={player.avatarUrl || '/assets/default-character.png'}
                      alt={player.username}
                      className="h-full w-full rounded-xl object-cover"
                    />
                    <div
                      className={`absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full font-black text-white shadow-md ${
                        isFirst ? 'bg-amber-400 text-zinc-950' : isSecond ? 'bg-slate-300 text-zinc-950' : 'bg-amber-700'
                      }`}
                    >
                      {isFirst ? <Crown className="h-4 w-4 fill-zinc-950" /> : <Medal className="h-4 w-4" />}
                    </div>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    RANK #{idx + 1}
                  </span>
                  <h3 className="mt-1 text-base font-black text-white max-w-[200px] truncate">
                    {player.username}
                  </h3>
                  <div className="mt-2 font-mono text-3xl font-black text-amber-400">
                    {player.bestScore} <span className="text-xs font-normal text-zinc-400">PTS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 10 CRAZY CHAOS MUTATIONS SHOWCASE */}
        <div className="mt-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-black tracking-widest text-rose-400">
              <Zap className="h-3.5 w-3.5" />
              UNPREDICTABLE GAMEPLAY
            </div>
            <h2 className="mt-2 text-2xl font-black uppercase tracking-wider text-white sm:text-3xl">
              10 RANDOM CHAOS EVENTS
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Every flight is mutated live by the arcade chaos engine!
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {chaosList.map(([key, def]) => (
              <div
                key={key}
                className="flex flex-col items-center rounded-2xl border border-white/5 bg-zinc-900/50 p-4 text-center transition hover:border-white/20 hover:bg-zinc-900"
              >
                <span className="text-3xl">{def.icon}</span>
                <h4 className="mt-2 text-xs font-black tracking-wider uppercase text-white">
                  {def.name}
                </h4>
                <p className="mt-1 text-[11px] text-zinc-400 leading-tight">
                  {def.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CALL TO ACTION */}
        <div className="mt-20 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 p-8 text-center sm:p-12">
          <h2 className="text-3xl font-black uppercase text-white sm:text-4xl">
            READY TO SURVIVE THE CHAOS?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-300">
            One tap is all it takes. Prove your arcade reflexes and claim your spot on the hall of fame.
          </p>
          <NextLink
            href="/play"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-fuchsia-600 px-10 py-4 text-lg font-black text-white shadow-xl shadow-rose-600/30 transition hover:scale-105 active:scale-95"
          >
            <Gamepad2 className="h-5 w-5" />
            ENTER THE CHAOS ARENA
          </NextLink>
        </div>
      </div>
    </div>
  );
}
