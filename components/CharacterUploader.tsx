'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Sparkles, RotateCcw, Check, Flame, Zap, Rainbow } from 'lucide-react';
import { CharacterConfig, TrailType } from '@/lib/types';
import { DEFAULT_CHARACTER } from '@/lib/constants';
import { loadCharacterConfig, saveCharacterConfig, removeAssetBlob } from '@/lib/storage';

export default function CharacterUploader() {
  const [config, setConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER);
  const [previewSrc, setPreviewSrc] = useState<string>(DEFAULT_CHARACTER.imageUrl);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCharacterConfig().then((cfg) => {
      setConfig(cfg);
      setPreviewSrc(cfg.imageUrl);
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|webp)$/i)) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPreviewSrc(result);
        setConfig((prev) => ({
          ...prev,
          imageUrl: result,
          isCustom: true,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    await saveCharacterConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = async () => {
    await removeAssetBlob('custom_character_image');
    await saveCharacterConfig(DEFAULT_CHARACTER);
    setConfig(DEFAULT_CHARACTER);
    setPreviewSrc(DEFAULT_CHARACTER.imageUrl);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const trails: { id: TrailType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'fire', label: 'Fire Trail', icon: <Flame className="h-4 w-4" />, color: '#ef4444' },
    { id: 'lightning', label: 'Lightning', icon: <Zap className="h-4 w-4" />, color: '#38bdf8' },
    { id: 'rainbow', label: 'Rainbow', icon: <Rainbow className="h-4 w-4" />, color: '#a855f7' },
    { id: 'neon_gold', label: 'Gold Aura', icon: <Sparkles className="h-4 w-4" />, color: '#f59e0b' },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black text-amber-400">CHARACTER LAB</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Upload your own face or hero sprite. Fly with customized auras and particle trails!
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Balayya Babu
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Live Floating Preview */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/60 p-6 lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">ARCADE FLIGHT PREVIEW</p>

          {/* Interactive animated flight preview */}
          <div className="relative mt-6 flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-b from-purple-900/20 to-black/60 border border-white/5">
            <div
              className="relative flex items-center justify-center transition-all animate-bounce"
              style={{
                filter: `drop-shadow(0 0 ${config.glowIntensity}px ${config.auraColor})`,
              }}
            >
              <img
                src={previewSrc}
                alt="Character Preview"
                className={`h-24 w-24 object-cover ${
                  config.shape === 'circle'
                    ? 'rounded-full ring-4'
                    : config.shape === 'square'
                    ? 'rounded-2xl ring-4'
                    : 'rounded-none'
                }`}
                style={{
                  transform: `scale(${config.scale})`,
                  borderColor: config.auraColor,
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-300">
              {config.isCustom ? 'Custom Upload Active' : 'Default Balayya Babu Avatar'}
            </span>
          </div>

          {/* File Upload Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 py-3 text-sm font-bold text-amber-400 transition hover:bg-amber-500/20 active:scale-95"
          >
            <Upload className="h-4 w-4" />
            Upload New Image (PNG, JPG, WebP)
          </button>
        </div>

        {/* Right Column: Customization Controls */}
        <div className="space-y-6 lg:col-span-7">
          {/* Shape Option */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Badge Style
            </label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {(['circle', 'square', 'raw'] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setConfig((p) => ({ ...p, shape }))}
                  className={`rounded-xl border p-2.5 text-xs font-bold capitalize transition ${
                    config.shape === shape
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                      : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {shape === 'circle' ? 'Circle Badge' : shape === 'square' ? 'Modern Rounded' : 'Raw Image'}
                </button>
              ))}
            </div>
          </div>

          {/* Particle Trail Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Particle Trail
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {trails.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setConfig((p) => ({ ...p, trailType: t.id }))}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-bold transition ${
                    config.trailType === t.id
                      ? 'border-amber-400 bg-white/10 text-white'
                      : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span style={{ color: t.color }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aura Glow Color */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Aura Glow Color
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {['#f59e0b', '#ef4444', '#ec4899', '#a855f7', '#38bdf8', '#10b981'].map((c) => (
                <button
                  key={c}
                  onClick={() => setConfig((p) => ({ ...p, auraColor: c }))}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    config.auraColor === c ? 'scale-125 border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}` }}
                />
              ))}
            </div>
          </div>

          {/* Scale Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span>Sprite Scale</span>
              <span className="text-amber-400">{config.scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={config.scale}
              onChange={(e) => setConfig((p) => ({ ...p, scale: parseFloat(e.target.value) }))}
              className="mt-2 w-full accent-amber-500"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-fuchsia-600 py-3.5 text-base font-black text-white shadow-xl shadow-rose-600/30 transition hover:brightness-110 active:scale-98"
            >
              {isSaved ? <Check className="h-5 w-5 text-emerald-300" /> : <Sparkles className="h-5 w-5" />}
              {isSaved ? 'Character Saved Successfully!' : 'Apply Character to Game'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
