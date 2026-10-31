import { Achievement, AudioSettings, CharacterConfig, GamePhysics, PlayerProfile } from './types';
import { DEFAULT_ACHIEVEMENTS, DEFAULT_CHARACTER, PHYSICS_PRESETS } from './constants';

const DB_NAME = 'FlappyChaosDB';
const DB_VERSION = 1;
const STORE_ASSETS = 'custom_assets';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('IndexedDB only available in browser'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        db.createObjectStore(STORE_ASSETS);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAssetBlob(key: string, dataUrl: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, 'readwrite');
      const store = tx.objectStore(STORE_ASSETS);
      store.put(dataUrl, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not save to IndexedDB, fallback to localStorage', err);
    try {
      localStorage.setItem(`fc_asset_${key}`, dataUrl);
    } catch (e) {
      console.error('Failed to save to localStorage as well', e);
    }
  }
}

export async function getAssetBlob(key: string): Promise<string | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_ASSETS, 'readonly');
      const store = tx.objectStore(STORE_ASSETS);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IndexedDB read error, trying localStorage', err);
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`fc_asset_${key}`);
    }
    return null;
  }
}

export async function removeAssetBlob(key: string): Promise<void> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, 'readwrite');
      const store = tx.objectStore(STORE_ASSETS);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`fc_asset_${key}`);
    }
  }
}

// Local Player Profile & Stats
export function getStoredProfile(): PlayerProfile {
  if (typeof window === 'undefined') {
    return {
      id: 'guest',
      username: 'Guest_Pilot',
      avatarUrl: '/assets/default-character.png',
      bestScore: 0,
      totalGames: 0,
      totalScore: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      isGuest: true,
    };
  }
  const raw = localStorage.getItem('fc_player_profile');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // ignore
    }
  }
  const defaultGuest: PlayerProfile = {
    id: 'guest_' + Math.random().toString(36).substring(2, 8),
    username: 'Balayya_Fan_' + Math.floor(100 + Math.random() * 900),
    avatarUrl: '/assets/default-character.png',
    bestScore: 0,
    totalGames: 0,
    totalScore: 0,
    createdAt: new Date().toISOString(),
    isGuest: true,
  };
  localStorage.setItem('fc_player_profile', JSON.stringify(defaultGuest));
  return defaultGuest;
}

export function saveStoredProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fc_player_profile', JSON.stringify(profile));
}

// Character Config
export async function loadCharacterConfig(): Promise<CharacterConfig> {
  if (typeof window === 'undefined') return DEFAULT_CHARACTER;
  try {
    const stored = localStorage.getItem('fc_character_config');
    const customImage = await getAssetBlob('custom_character_image');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (customImage) {
        parsed.imageUrl = customImage;
        parsed.isCustom = true;
      }
      return parsed;
    }
    if (customImage) {
      return { ...DEFAULT_CHARACTER, imageUrl: customImage, isCustom: true };
    }
  } catch (e) {
    console.error('Error loading character config', e);
  }
  return DEFAULT_CHARACTER;
}

export async function saveCharacterConfig(config: CharacterConfig): Promise<void> {
  if (typeof window === 'undefined') return;
  if (config.isCustom && config.imageUrl.startsWith('data:')) {
    await saveAssetBlob('custom_character_image', config.imageUrl);
  }
  localStorage.setItem('fc_character_config', JSON.stringify(config));
}

// Audio Settings
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.8,
  bgmVolume: 0.75,
  sfxVolume: 0.85,
  isMuted: false,
  customBgmUrl: '/assets/default-bgm.mp3',
};

export async function loadAudioSettings(): Promise<AudioSettings> {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  try {
    const stored = localStorage.getItem('fc_audio_settings');
    const customBgm = await getAssetBlob('custom_bgm_audio');
    const base = stored ? JSON.parse(stored) : DEFAULT_AUDIO_SETTINGS;
    if (customBgm) {
      base.customBgmUrl = customBgm;
    } else if (!base.customBgmUrl) {
      base.customBgmUrl = '/assets/default-bgm.mp3';
    }
    return base;
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export async function saveAudioSettings(settings: AudioSettings): Promise<void> {
  if (typeof window === 'undefined') return;
  if (settings.customBgmUrl && settings.customBgmUrl.startsWith('data:')) {
    await saveAssetBlob('custom_bgm_audio', settings.customBgmUrl);
  }
  localStorage.setItem('fc_audio_settings', JSON.stringify(settings));
}

// Achievements
export function getUnlockedAchievements(): Achievement[] {
  if (typeof window === 'undefined') return DEFAULT_ACHIEVEMENTS;
  const raw = localStorage.getItem('fc_unlocked_achievements');
  if (raw) {
    try {
      const savedIds = new Set<string>(JSON.parse(raw));
      return DEFAULT_ACHIEVEMENTS.map((a) => ({
        ...a,
        unlockedAt: savedIds.has(a.id) ? new Date().toISOString() : undefined,
      }));
    } catch {
      // ignore
    }
  }
  return DEFAULT_ACHIEVEMENTS;
}

export function unlockAchievement(achievementId: string): void {
  if (typeof window === 'undefined') return;
  const current = getUnlockedAchievements()
    .filter((a) => !!a.unlockedAt)
    .map((a) => a.id);
  if (!current.includes(achievementId)) {
    current.push(achievementId);
    localStorage.setItem('fc_unlocked_achievements', JSON.stringify(current));
  }
}

// Physics & Difficulty
export function loadGamePhysics(): GamePhysics {
  if (typeof window === 'undefined') return PHYSICS_PRESETS.arcade;
  const stored = localStorage.getItem('fc_game_physics');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  return PHYSICS_PRESETS.arcade;
}

export function saveGamePhysics(physics: GamePhysics): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fc_game_physics', JSON.stringify(physics));
}
