'use client';

import { AudioSettings } from './types';
import { DEFAULT_AUDIO_SETTINGS, loadAudioSettings } from './storage';

class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private settings: AudioSettings = DEFAULT_AUDIO_SETTINGS;
  private initialized: boolean = false;
  private isBgmPlaying: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initSettings();
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private async initSettings() {
    this.settings = await loadAudioSettings();
    this.setupBgm();
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public async resumeContext(): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }
    this.initialized = true;
  }

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.getEffectiveBgmVolume();
      this.bgmAudio.muted = this.settings.isMuted;
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private getEffectiveBgmVolume(): number {
    if (this.settings.isMuted) return 0;
    return Math.max(0, Math.min(1, this.settings.masterVolume * this.settings.bgmVolume));
  }

  private getEffectiveSfxVolume(): number {
    if (this.settings.isMuted) return 0;
    return Math.max(0, Math.min(1, this.settings.masterVolume * this.settings.sfxVolume));
  }

  public setupBgm(url?: string): void {
    if (typeof window === 'undefined') return;
    const bgmSource = url || this.settings.customBgmUrl || '/assets/default-bgm.mp3';

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      this.bgmAudio.preload = 'auto';
    }

    if (this.bgmAudio.src !== bgmSource) {
      this.bgmAudio.src = bgmSource;
    }

    this.bgmAudio.volume = this.getEffectiveBgmVolume();
    this.bgmAudio.muted = this.settings.isMuted;
  }

  public async startBgm(): Promise<void> {
    if (typeof window === 'undefined') return;
    this.resumeContext();
    if (!this.bgmAudio) {
      this.setupBgm();
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.getEffectiveBgmVolume();
      this.bgmAudio.muted = this.settings.isMuted;
      try {
        await this.bgmAudio.play();
        this.isBgmPlaying = true;
      } catch {
        // Autoplay policy prevented playback until user taps
        this.isBgmPlaying = false;
      }
    }
  }

  public stopBgm(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.isBgmPlaying = false;
    }
  }

  public pauseBgm(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.isBgmPlaying = false;
    }
  }

  public resumeBgm(): void {
    if (this.bgmAudio && !this.settings.isMuted) {
      this.bgmAudio.play().catch(() => {});
      this.isBgmPlaying = true;
    }
  }

  // SYNTHESIZED SFX (Guaranteed zero-latency and 100% offline support)
  public playTapSound(): void {
    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;

      // Punchy upward pitch sweep
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);

      gain.gain.setValueAtTime(sfxVol * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // AudioContext unavailable
    }
  }

  public playScoreSound(): void {
    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High-pitched bright double chime
      [880, 1320].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.05;

        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(sfxVol * 0.35, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.13);
      });
    } catch {
      // Ignore
    }
  }

  public playDeathSound(): void {
    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Heavy thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

      gain.gain.setValueAtTime(sfxVol * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);

      // 2. White noise explosion burst
      const bufferSize = ctx.sampleRate * 0.25;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(sfxVol * 0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.26);
    } catch {
      // Ignore
    }
  }

  public playChaosEventSound(): void {
    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Sci-fi warp siren
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';

      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(740, now + 0.15);
      osc.frequency.linearRampToValueAtTime(440, now + 0.3);

      gain.gain.setValueAtTime(sfxVol * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore
    }
  }

  public playAchievementSound(): void {
    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Majestic arcade fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, High C
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.08;

        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(sfxVol * 0.4, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  public playNearMissSound(): void {
    const sfxVol = this.getEffectiveSfxVolume();
    if (sfxVol <= 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(sfxVol * 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }
}

export const audioManager = AudioManager.getInstance();
