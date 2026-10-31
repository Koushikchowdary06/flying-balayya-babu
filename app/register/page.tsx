'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, User, Lock, Flame, Sparkles } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { saveStoredProfile, getStoredProfile } from '@/lib/storage';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (username.length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      setLoading(false);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              avatar_url: '/assets/default-character.png',
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          const profile = getStoredProfile();
          profile.id = data.user.id;
          profile.username = username.trim();
          profile.isGuest = false;
          saveStoredProfile(profile);

          setSuccessMsg('Registration successful! Redirecting to profile...');
          setTimeout(() => router.push('/profile'), 1500);
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed';
        setErrorMsg(msg);
        setLoading(false);
        return;
      }
    } else {
      // Local fallback mode
      const profile = getStoredProfile();
      profile.username = username.trim();
      profile.isGuest = false;
      saveStoredProfile(profile);
      setSuccessMsg('Registration successful! Redirecting to profile...');
      setTimeout(() => router.push('/profile'), 1000);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
            <Flame className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-black uppercase text-white">ENLIST PILOT</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Create your pilot identity to climb the global leaderboard
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Pilot Call-Sign (Username)
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                required
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. BalayyaBoss"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Email Address
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@flappychaos.com"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 py-3 text-sm font-black text-white shadow-lg shadow-rose-600/30 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Sparkles className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {loading ? 'Creating Pilot...' : 'REGISTER PILOT'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
          <span>Already registered?</span>
          <NextLink href="/login" className="font-bold text-amber-400 hover:underline">
            Pilot Login
          </NextLink>
        </div>
      </div>
    </div>
  );
}
