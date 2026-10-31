'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Gauge, ShieldAlert, RotateCcw, Check, Sparkles } from 'lucide-react';
import { GamePhysics } from '@/lib/types';
import { PHYSICS_PRESETS } from '@/lib/constants';
import { loadGamePhysics, saveGamePhysics, loadAudioSettings, saveAudioSettings } from '@/lib/storage';
import { audioManager } from '@/lib/audio-manager';

export default function SettingsPanel() {
  const [physics, setPhysics] = useState<GamePhysics>(PHYSICS_PRESETS.arcade);
  const [isMuted, setIsMuted] = useState(false);
  const [masterVol, setMasterVol] = useState(0.8);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPhysics(loadGamePhysics());
    loadAudioSettings().then((s) => {
      setIsMuted(s.isMuted);
      setMasterVol(s.masterVolume);
    });
    setReducedMotion(localStorage.getItem('fc_reduced_motion') === 'true');
  }, []);

  const handleDifficultyChange = (diff: GamePhysics['difficulty']) => {
    const updated = { ...PHYSICS_PRESETS[diff] };
    setPhysics(updated);
    saveGamePhysics(updated);
  };

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioManager.updateSettings({ isMuted: next });
    loadAudioSettings().then((s) => saveAudioSettings({ ...s, isMuted: next }));
  };

  const handleMasterVolChange = (val: number) => {
    setMasterVol(val);
    audioManager.updateSettings({ masterVolume: val });
    loadAudioSettings().then((s) => saveAudioSettings({ ...s, masterVolume: val }));
  };

  const handleReducedMotionToggle = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem('fc_reduced_motion', String(next));
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to reset all local high scores and settings?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSave = () => {
    saveGamePhysics(physics);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-black text-white">ARCADE SETTINGS</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Fine-tune gameplay difficulty, sound levels, and visual preferences.
        </p>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
          <Gauge className="h-4 w-4 text-amber-400" />
          GAMEPLAY DIFFICULTY PRESET
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              { id: 'casual', label: 'Casual Flight', desc: 'Gentler gravity, wider pipe gaps' },
              { id: 'arcade', label: 'Standard Arcade', desc: 'Authentic 60 FPS challenge' },
              { id: 'chaos', label: 'Chaos Insanity', desc: 'High gravity, fast pipes, extreme' },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleDifficultyChange(mode.id)}
              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${
                physics.difficulty === mode.id
                  ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                  : 'border-white/10 bg-zinc-900/60 hover:bg-zinc-900'
              }`}
            >
              <span className={`text-sm font-black ${physics.difficulty === mode.id ? 'text-amber-400' : 'text-white'}`}>
                {mode.label}
              </span>
              <span className="mt-1 text-xs text-zinc-400">{mode.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Audio Quick Sliders */}
      <div className="space-y-4 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            AUDIO MASTER CONTROLS
          </span>
          <button
            onClick={handleMuteToggle}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
            {isMuted ? 'Muted' : 'Sound On'}
          </button>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold text-zinc-300">
            <span>Master Volume</span>
            <span className="font-mono text-amber-400">{Math.round(masterVol * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVol}
            onChange={(e) => handleMasterVolChange(parseFloat(e.target.value))}
            className="mt-2 w-full accent-amber-500"
          />
        </div>
      </div>

      {/* Graphics & Motion */}
      <div className="space-y-4 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white">Reduced Motion</span>
            <p className="text-xs text-zinc-400">Minimizes intense screen shake effects</p>
          </div>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={handleReducedMotionToggle}
            className="h-5 w-5 rounded border-white/10 bg-zinc-900 accent-amber-500"
          />
        </div>
      </div>

      {/* Clear Data & Reset */}
      <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handleClearData}
          className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
        >
          <ShieldAlert className="h-4 w-4" />
          Clear All Local Data & High Scores
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg active:scale-95"
        >
          {saved ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
