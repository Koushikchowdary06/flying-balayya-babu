'use client';

import React, { useState, useEffect } from 'react';
import { User, Trophy, Flame, Check, Edit2, ShieldCheck, Lock } from 'lucide-react';
import { PlayerProfile, Achievement } from '@/lib/types';
import { getStoredProfile, saveStoredProfile, getUnlockedAchievements } from '@/lib/storage';

export default function PlayerProfileComponent() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    const p = getStoredProfile();
    setProfile(p);
    setNewUsername(p.username);
    setAchievements(getUnlockedAchievements());
  }, []);

  const handleSaveUsername = () => {
    if (!profile || !newUsername.trim()) return;
    const updated = { ...profile, username: newUsername.trim() };
    saveStoredProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  if (!profile) return null;

  const unlockedCount = achievements.filter((a) => !!a.unlockedAt).length;
  const avgScore = profile.totalGames > 0 ? Math.round(profile.totalScore / profile.totalGames) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with Glow */}
          <div className="relative h-28 w-28 shrink-0 rounded-2xl border-2 border-amber-400 bg-zinc-900 p-1 shadow-xl shadow-amber-500/20">
            <img
              src={profile.avatarUrl || '/assets/default-character.png'}
              alt={profile.username}
              className="h-full w-full rounded-xl object-cover"
            />
            <div className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white shadow-md">
              <Flame className="h-4 w-4" />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    maxLength={20}
                    className="rounded-xl border border-amber-400 bg-zinc-900 px-3 py-1 text-lg font-black text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="rounded-xl bg-amber-500 p-2 text-zinc-950 font-bold"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h1 className="text-2xl font-black text-white sm:text-3xl">
                    {profile.username}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              <span className="inline-flex items-center gap-1 self-center sm:self-auto rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                {profile.isGuest ? 'Local Pilot' : 'Verified Pilot'}
              </span>
            </div>

            <p className="mt-1 text-xs text-zinc-400">
              Pilot ID: <span className="font-mono text-zinc-300">{profile.id}</span> • Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>

            {savedMessage && (
              <p className="mt-2 text-xs font-bold text-emerald-400">
                Profile updated successfully!
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              BEST SCORE
            </span>
            <div className="mt-1 font-mono text-3xl font-black text-amber-400">
              {profile.bestScore}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              TOTAL GAMES
            </span>
            <div className="mt-1 font-mono text-3xl font-black text-rose-400">
              {profile.totalGames}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              TOTAL POINTS
            </span>
            <div className="mt-1 font-mono text-3xl font-black text-sky-400">
              {profile.totalScore}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              AVERAGE SCORE
            </span>
            <div className="mt-1 font-mono text-3xl font-black text-emerald-400">
              {avgScore}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-white">ACHIEVEMENTS & BADGES</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Complete chaos milestones to unlock exclusive badges!
            </p>
          </div>
          <span className="rounded-full bg-amber-400/20 px-3 py-1 font-mono text-xs font-black text-amber-400">
            {unlockedCount} / {achievements.length} UNLOCKED
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;

            return (
              <div
                key={ach.id}
                className={`relative flex items-start gap-3.5 rounded-2xl border p-4 transition ${
                  isUnlocked
                    ? 'border-amber-400/40 bg-zinc-900/80 shadow-lg shadow-amber-500/10'
                    : 'border-white/5 bg-zinc-900/30 opacity-60'
                }`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                    isUnlocked ? 'bg-amber-400/20 ring-1 ring-amber-400' : 'bg-white/5'
                  }`}
                >
                  {isUnlocked ? ach.icon : <Lock className="h-5 w-5 text-zinc-500" />}
                </div>

                <div>
                  <h3 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-zinc-400'}`}>
                    {ach.name}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    {ach.description}
                  </p>
                  {isUnlocked && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                      <Check className="h-3 w-3" /> Unlocked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
