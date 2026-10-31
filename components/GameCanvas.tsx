'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '@/lib/game-engine';
import { ChaosEvent, CharacterConfig, GameScoreResult, PlayerProfile } from '@/lib/types';
import { loadCharacterConfig, loadGamePhysics, getStoredProfile } from '@/lib/storage';
import { audioManager } from '@/lib/audio-manager';
import ScoreCard from './ScoreCard';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [score, setScore] = useState<number>(0);
  const [activeChaos, setActiveChaos] = useState<ChaosEvent | null>(null);
  const [gameResult, setGameResult] = useState<GameScoreResult | null>(null);
  const [profile, setProfile] = useState<PlayerProfile>({
    id: 'guest',
    username: 'Guest_Pilot',
    avatarUrl: '/assets/default-character.png',
    bestScore: 0,
    totalGames: 0,
    totalScore: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    isGuest: true,
  });
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    // Load configurations
    loadCharacterConfig().then((cfg) => engine.setCharacterConfig(cfg));
    engine.setPhysics(loadGamePhysics());
    setProfile(getStoredProfile());

    const audioSettings = audioManager.getSettings();
    setIsMuted(audioSettings.isMuted);

    // Callbacks
    engine.onScoreChange = (newScore) => {
      setScore(newScore);
    };

    engine.onChaosEvent = (chaos) => {
      setActiveChaos(chaos ? { ...chaos } : null);
    };

    engine.onGameOver = (result) => {
      setGameResult(result);
      setProfile(getStoredProfile());
    };

    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
    };
  }, []);

  const handleAction = useCallback(() => {
    if (isPaused || gameResult) return;
    if (!hasStarted) {
      setHasStarted(true);
    }
    audioManager.resumeContext();
    if (engineRef.current) {
      engineRef.current.flap();
    }
  }, [isPaused, gameResult, hasStarted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleAction();
      } else if (e.code === 'KeyP') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction]);

  const togglePause = () => {
    if (!engineRef.current || engineRef.current.status !== 'PLAYING') return;
    const next = !isPaused;
    setIsPaused(next);
    if (next) {
      audioManager.pauseBgm();
    } else {
      audioManager.resumeBgm();
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioManager.updateSettings({ isMuted: next });
  };

  const handleRestart = () => {
    setGameResult(null);
    setScore(0);
    setActiveChaos(null);
    setHasStarted(true);
    if (engineRef.current) {
      engineRef.current.start();
    }
  };

  return (
    <div
      className="relative flex h-[calc(100vh-65px)] w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 select-none touch-none"
      onPointerDown={handleAction}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="h-full w-full max-w-5xl cursor-pointer object-contain"
      />

      {/* TOP HUD (Score & Controls) */}
      <div className="absolute top-4 left-0 right-0 pointer-events-none mx-auto flex max-w-4xl items-center justify-between px-6">
        {/* Personal Best Pill */}
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-black/70 px-4 py-2 backdrop-blur-md shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            BEST: <span className="font-mono text-base font-black text-white">{profile.bestScore}</span>
          </span>
        </div>

        {/* Big Neon Score */}
        <div className="text-center drop-shadow-[0_0_25px_rgba(245,158,11,0.7)]">
          <span className="font-black text-6xl text-amber-400 font-mono tracking-tighter sm:text-7xl">
            {score}
          </span>
        </div>

        {/* Top Right Buttons (Pause + Mute) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/50 text-zinc-300 backdrop-blur-md transition hover:bg-white/10 active:scale-95"
          >
            {isMuted ? <VolumeX className="h-5 w-5 text-rose-400" /> : <Volume2 className="h-5 w-5 text-amber-400" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePause();
            }}
            aria-label={isPaused ? 'Resume' : 'Pause'}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/50 text-zinc-300 backdrop-blur-md transition hover:bg-white/10 active:scale-95"
          >
            {isPaused ? <Play className="h-5 w-5 text-emerald-400" /> : <Pause className="h-5 w-5 text-zinc-300" />}
          </button>
        </div>
      </div>

      {/* START PROMPT */}
      {!hasStarted && !gameResult && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="flex flex-col items-center rounded-3xl border border-amber-400/60 bg-zinc-950/90 p-7 shadow-2xl text-center">
            <span className="text-4xl animate-bounce">🦁</span>
            <h2 className="mt-2 text-2xl font-black tracking-wider text-amber-400">
              TAP OR PRESS SPACE
            </h2>
            <p className="mt-1 text-sm font-bold text-yellow-300">
              FLY BALAYYA BABU!
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Dodge pipes, survive chaos mutations, and claim #1!
            </p>
          </div>
        </div>
      )}

      {/* PAUSE OVERLAY */}
      {isPaused && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="rounded-3xl border border-white/20 bg-zinc-950 p-8 text-center shadow-2xl">
            <h2 className="text-3xl font-black text-amber-400">GAME PAUSED</h2>
            <p className="mt-2 text-sm text-zinc-400">Catch your breath before resuming the chaos.</p>
            <button
              onClick={togglePause}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 px-8 py-3 font-bold text-white shadow-lg active:scale-95"
            >
              <Play className="h-5 w-5" />
              RESUME GAME
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER SCORECARD MODAL */}
      {gameResult && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <ScoreCard
            result={gameResult}
            profile={profile}
            onPlayAgain={handleRestart}
          />
        </div>
      )}
    </div>
  );
}
