export type GameStatus = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'DYING' | 'GAME_OVER';

export type ChaosEventType =
  | 'LOW_GRAVITY'
  | 'SUPER_SPEED'
  | 'REVERSE_GRAVITY'
  | 'EARTHQUAKE'
  | 'DARK_MODE'
  | 'GIANT_MODE'
  | 'MINI_MODE'
  | 'INVISIBLE_OBSTACLES'
  | 'SLOW_MOTION'
  | 'CHAOS_MODE';

export interface ChaosEvent {
  type: ChaosEventType;
  name: string;
  description: string;
  durationMs: number;
  remainingMs: number;
  color: string;
  icon: string;
}

export type TrailType = 'fire' | 'lightning' | 'rainbow' | 'neon_gold' | 'cyber_matrix' | 'none';

export interface CharacterConfig {
  imageUrl: string;
  isCustom: boolean;
  scale: number;
  auraColor: string;
  trailType: TrailType;
  glowIntensity: number;
  shape: 'circle' | 'square' | 'raw';
}

export interface AudioSettings {
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  customBgmUrl?: string;
  customTapUrl?: string;
  customDeathUrl?: string;
  customScoreUrl?: string;
}

export interface GamePhysics {
  gravity: number;
  jumpForce: number;
  pipeSpeed: number;
  pipeSpawnInterval: number;
  pipeGap: number;
  difficulty: 'casual' | 'arcade' | 'chaos';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'spark' | 'star';
}

export interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  bottomHeight: number;
  width: number;
  passed: boolean;
  highlighted?: boolean;
}

export interface PlayerProfile {
  id: string;
  username: string;
  avatarUrl: string;
  bestScore: number;
  totalGames: number;
  totalScore: number;
  createdAt: string;
  isGuest: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  avatarUrl: string;
  bestScore: number;
  totalGames?: number;
  scoreDate?: string;
  isCurrentPlayer?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'score' | 'games' | 'streak' | 'special';
  threshold: number;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface GameScoreResult {
  score: number;
  personalBest: number;
  previousBest: number;
  isNewBest: boolean;
  chaosEventsSurvived: number;
  nearMisses: number;
  globalRank?: number;
  dailyRank?: number;
  weeklyRank?: number;
  deathMessage: string;
  unlockedAchievements: Achievement[];
}
