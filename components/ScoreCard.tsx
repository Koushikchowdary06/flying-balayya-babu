'use client';

import React, { useEffect, useState } from 'react';
import NextLink from 'next/link';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Share2, Home, Flame, Sparkles } from 'lucide-react';
import { GameScoreResult, PlayerProfile } from '@/lib/types';
import ShareModal from './ShareModal';

interface ScoreCardProps {
  result: GameScoreResult;
  profile: PlayerProfile;
  onPlayAgain: () => void;
}

export default function ScoreCard({ result, profile, onPlayAgain }: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    // Score count-up animation
    const duration = 1000;
    const target = result.score;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.min(target, Math.round((step / steps) * target));
      setDisplayScore(current);
      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    // Fire Confetti if personal best or score >= 20
    if (result.isNewBest || result.score >= 20) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#ec4899', '#38bdf8', '#10b981'],
      });
    }

    return () => clearInterval(timer);
  }, [result]);

  return (
    <>
      <div className="relative w-full max-w-md rounded-3xl border border-amber-500/40 bg-zinc-950/95 p-6 shadow-2xl shadow-rose-950/60 backdrop-blur-2xl">
        {/* Glow Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-black tracking-widest text-amber-400">
            <Flame className="h-4 w-4 text-rose-500" />
            JAI BALAYYA! FLIGHT CONCLUDED
          </div>

          <h2 className="mt-3 text-2xl font-black uppercase tracking-wider text-white">
            PLAYER: <span className="text-amber-400">{profile.username}</span>
          </h2>
        </div>

        {/* Character Avatar Showcase */}
        <div className="mt-4 flex justify-center">
          <div className="relative h-20 w-20 rounded-2xl border-2 border-amber-400/80 bg-zinc-900 p-1 shadow-lg shadow-amber-500/30">
            <img
              src={profile.avatarUrl || '/assets/default-character.png'}
              alt={profile.username}
              className="h-full w-full rounded-xl object-cover"
            />
            {result.isNewBest && (
              <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>

        {/* Score Display Card */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-900/80 p-5 text-center">
          <p className="text-xs font-bold tracking-widest text-zinc-400">FINAL SCORE</p>
          <div className="mt-1 text-6xl font-black text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]">
            {displayScore}
          </div>

          {result.isNewBest ? (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 px-3 py-1 text-xs font-black text-white shadow-md">
              <Sparkles className="h-3.5 w-3.5" />
              NEW PERSONAL BEST! (Previous: {result.previousBest})
            </div>
          ) : (
            <p className="mt-2 text-xs font-semibold text-zinc-400">
              Personal Best: <span className="text-zinc-200">{result.personalBest}</span>
            </p>
          )}

          {/* Funny Score Message */}
          <p className="mt-4 text-sm font-semibold italic text-rose-400">
            “{result.deathMessage}”
          </p>
        </div>

        {/* Dynamic Leaderboard Rankings */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-zinc-900/50 p-3 text-center text-xs">
          <div>
            <span className="block text-[10px] font-bold text-zinc-400">GLOBAL RANK</span>
            <span className="text-sm font-black text-amber-400">#{result.globalRank || 1}</span>
          </div>
          <div className="border-x border-white/10">
            <span className="block text-[10px] font-bold text-zinc-400">DAILY RANK</span>
            <span className="text-sm font-black text-sky-400">#{result.dailyRank || 1}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-zinc-400">WEEKLY RANK</span>
            <span className="text-sm font-black text-emerald-400">#{result.weeklyRank || 1}</span>
          </div>
        </div>

        {/* Extra Run Stats */}
        <div className="mt-3 flex items-center justify-between px-2 text-xs text-zinc-400">
          <span>Flight Rating: <strong className="text-amber-400 font-bold">JAI BALAYYA 🦁</strong></span>
          <span>Near Misses: <strong className="text-amber-400">{result.nearMisses}</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={onPlayAgain}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-fuchsia-600 py-3.5 text-base font-black text-white shadow-xl shadow-rose-600/30 transition hover:brightness-110 active:scale-98"
          >
            <RotateCcw className="h-5 w-5" />
            PLAY AGAIN
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-800 active:scale-95"
            >
              <Share2 className="h-4 w-4 text-sky-400" />
              Share
            </button>

            <NextLink
              href="/leaderboard"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-800 active:scale-95"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              Ranks
            </NextLink>

            <NextLink
              href="/"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-800 active:scale-95"
            >
              <Home className="h-4 w-4 text-rose-400" />
              Home
            </NextLink>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        result={result}
        profile={profile}
      />
    </>
  );
}
