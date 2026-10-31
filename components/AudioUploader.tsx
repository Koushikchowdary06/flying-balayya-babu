'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Square, Upload, RotateCcw, Check, Sparkles } from 'lucide-react';
import { AudioSettings } from '@/lib/types';
import { DEFAULT_AUDIO_SETTINGS, loadAudioSettings, saveAudioSettings, removeAssetBlob } from '@/lib/storage';
import { audioManager } from '@/lib/audio-manager';

export default function AudioUploader() {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAudioSettings().then((s) => setSettings(s));
  }, []);

  const handleBgmUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^audio\/(mpeg|mp3|wav|ogg)$/i) && !file.name.match(/\.(mp3|wav|ogg)$/i)) {
      alert('Please upload an audio file (MP3, WAV, or OGG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSettings((prev) => ({
          ...prev,
          customBgmUrl: result,
        }));
        audioManager.setupBgm(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTogglePreview = () => {
    if (isPlayingPreview) {
      audioManager.stopBgm();
      setIsPlayingPreview(false);
    } else {
      audioManager.setupBgm(settings.customBgmUrl);
      audioManager.startBgm();
      setIsPlayingPreview(true);
    }
  };

  const handleVolumeChange = (key: keyof AudioSettings, value: number) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    audioManager.updateSettings(next);
  };

  const handleSave = async () => {
    await saveAudioSettings(settings);
    audioManager.updateSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = async () => {
    await removeAssetBlob('custom_bgm_audio');
    await saveAudioSettings(DEFAULT_AUDIO_SETTINGS);
    setSettings(DEFAULT_AUDIO_SETTINGS);
    audioManager.updateSettings(DEFAULT_AUDIO_SETTINGS);
    audioManager.setupBgm('/assets/default-bgm.mp3');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black text-rose-400">AUDIO STUDIO</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Tune volume, test sound effects, and upload your own gaming soundtrack!
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Default Music
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Background Music Uploader & Player */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 lg:col-span-6">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            FLYING BACKGROUND MUSIC
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-zinc-950 p-4">
            <div className="flex items-center gap-3 truncate">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <Volume2 className="h-5 w-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">
                  {settings.customBgmUrl?.startsWith('data:') ? 'Custom Uploaded Soundtrack' : 'Nee Kanti Choopulloki (Telugu Hero Anthem)'}
                </p>
                <p className="text-xs text-zinc-400">Continuous loop during flight</p>
              </div>
            </div>

            <button
              onClick={handleTogglePreview}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold transition active:scale-95 ${
                isPlayingPreview
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-white/10 text-zinc-200 hover:bg-white/20'
              }`}
            >
              {isPlayingPreview ? <Square className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBgmUpload}
            accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rose-500/40 bg-rose-500/10 py-3 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 active:scale-95"
          >
            <Upload className="h-4 w-4" />
            Upload Custom MP3 / WAV
          </button>

          {/* Test Sound Effects Grid */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              TEST ARCADE SOUND FX
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                onClick={() => audioManager.playTapSound()}
                className="rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
              >
                Tap / Jump
              </button>
              <button
                onClick={() => audioManager.playScoreSound()}
                className="rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-bold text-emerald-400 hover:bg-zinc-800"
              >
                +1 Score
              </button>
              <button
                onClick={() => audioManager.playDeathSound()}
                className="rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-bold text-rose-400 hover:bg-zinc-800"
              >
                Death Thud
              </button>
              <button
                onClick={() => audioManager.playChaosEventSound()}
                className="rounded-xl border border-white/10 bg-zinc-900 py-2.5 text-xs font-bold text-amber-400 hover:bg-zinc-800"
              >
                Chaos Siren
              </button>
            </div>
          </div>
        </div>

        {/* Right: Master, BGM, SFX volume sliders */}
        <div className="space-y-6 lg:col-span-6">
          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Master Volume</span>
              <span className="text-amber-400">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => handleVolumeChange('masterVolume', parseFloat(e.target.value))}
              className="mt-2 w-full accent-amber-500"
            />
          </div>

          {/* BGM Volume */}
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Music Volume</span>
              <span className="text-rose-400">{Math.round(settings.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.bgmVolume}
              onChange={(e) => handleVolumeChange('bgmVolume', parseFloat(e.target.value))}
              className="mt-2 w-full accent-rose-500"
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Sound Effects (SFX) Volume</span>
              <span className="text-emerald-400">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
              className="mt-2 w-full accent-emerald-500"
            />
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-400 py-3.5 text-base font-black text-white shadow-xl shadow-rose-600/30 transition hover:brightness-110 active:scale-98"
            >
              {isSaved ? <Check className="h-5 w-5 text-emerald-300" /> : <Sparkles className="h-5 w-5" />}
              {isSaved ? 'Audio Settings Saved!' : 'Save Audio Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
