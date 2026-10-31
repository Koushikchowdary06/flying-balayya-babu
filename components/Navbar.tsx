'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/navigation';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Gamepad2,
  Trophy,
  Palette,
  Volume2,
  VolumeX,
  User,
  Settings as SettingsIcon,
  Flame,
} from 'lucide-react';
import { audioManager } from '@/lib/audio-manager';
import { getStoredProfile } from '@/lib/storage';
import { PlayerProfile } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    setProfile(getStoredProfile());
    const audioSettings = audioManager.getSettings();
    setIsMuted(audioSettings.isMuted);
  }, [pathname]);

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    audioManager.updateSettings({ isMuted: nextState });
  };

  const navLinks = [
    { href: '/play', label: 'Play Now', icon: Gamepad2, highlight: true },
    { href: '/customize', label: 'Customize', icon: Palette },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo */}
        <NextLink href="/" className="group flex items-center gap-2.5 transition">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/40">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950 font-black text-amber-400">
              <Flame className="h-5 w-5 text-amber-400 transition group-hover:scale-110" />
            </div>
          </div>
          <div>
            <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500 bg-clip-text text-xl font-black tracking-wider text-transparent">
              FLAPPY CHAOS
            </span>
            <span className="hidden text-[10px] font-bold tracking-widest text-zinc-400 sm:block">
              ONE TAP. INFINITE CHAOS.
            </span>
          </div>
        </NextLink>

        {/* Navigation Items */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            if (link.highlight) {
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rose-600/30 transition hover:opacity-90 active:scale-95"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NextLink>
              );
            }

            return (
              <NextLink
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold shadow-inner'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NextLink>
            );
          })}
        </nav>

        {/* Right side controls (Mute + Profile) */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 text-zinc-300 transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            {isMuted ? <VolumeX className="h-5 w-5 text-rose-400" /> : <Volume2 className="h-5 w-5 text-amber-400" />}
          </button>

          {profile && (
            <NextLink
              href="/profile"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 p-1.5 pr-3 transition hover:border-amber-500/40 hover:bg-zinc-800"
            >
              {/* Avatar circle */}
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="h-7 w-7 rounded-lg object-cover ring-1 ring-amber-400/50"
              />
              <span className="hidden text-xs font-semibold text-zinc-200 sm:inline max-w-[100px] truncate">
                {profile.username}
              </span>
            </NextLink>
          )}

          {/* Mobile Play CTA */}
          <NextLink
            href="/play"
            className="flex md:hidden items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-rose-600/30"
          >
            PLAY
          </NextLink>
        </div>
      </div>
    </header>
  );
}
