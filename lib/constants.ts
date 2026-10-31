import { Achievement, ChaosEventType, CharacterConfig, GamePhysics } from './types';

export const DEFAULT_CHARACTER: CharacterConfig = {
  imageUrl: '/assets/default-character.png',
  isCustom: false,
  scale: 1,
  auraColor: '#f59e0b', // Gold neon aura
  trailType: 'fire',
  glowIntensity: 18,
  shape: 'circle',
};

export const CHAOS_EVENT_DEFINITIONS: Record<
  ChaosEventType,
  { name: string; description: string; durationMs: number; color: string; icon: string }
> = {
  LOW_GRAVITY: {
    name: 'LOW GRAVITY',
    description: 'Lunar buoyancy active! You float like a feather.',
    durationMs: 7000,
    color: '#38bdf8',
    icon: '🪶',
  },
  SUPER_SPEED: {
    name: 'SUPER SPEED',
    description: 'Warp speed! Pipes flying twice as fast!',
    durationMs: 6000,
    color: '#ef4444',
    icon: '⚡',
  },
  REVERSE_GRAVITY: {
    name: 'REVERSE GRAVITY',
    description: 'Ceiling magnetic pull! Inverted gravity!',
    durationMs: 6500,
    color: '#a855f7',
    icon: '🔄',
  },
  EARTHQUAKE: {
    name: 'EARTHQUAKE',
    description: 'Tectonic rumble! Screen violently shaking!',
    durationMs: 5500,
    color: '#eab308',
    icon: '🌋',
  },
  DARK_MODE: {
    name: 'DARK MODE',
    description: 'Blackout! Only your glowing aura lights the way.',
    durationMs: 8000,
    color: '#6366f1',
    icon: '🌑',
  },
  GIANT_MODE: {
    name: 'GIANT MODE',
    description: 'Colossal Titan! Massive character, high risk!',
    durationMs: 6500,
    color: '#ec4899',
    icon: '🦍',
  },
  MINI_MODE: {
    name: 'MINI MODE',
    description: 'Pocket Size! Nimble micro-hero slipstream!',
    durationMs: 7500,
    color: '#10b981',
    icon: '🐜',
  },
  INVISIBLE_OBSTACLES: {
    name: 'GHOST OBSTACLES',
    description: 'Pipes phasing into the shadow realm!',
    durationMs: 6000,
    color: '#06b6d4',
    icon: '👻',
  },
  SLOW_MOTION: {
    name: 'BULLET TIME',
    description: 'Matrix dilation! Slow-motion reflex mastery.',
    durationMs: 7000,
    color: '#14b8a6',
    icon: '⏳',
  },
  CHAOS_MODE: {
    name: 'ULTIMATE CHAOS',
    description: 'MAYHEM! Speed + Earthquake + Dark Mode combined!',
    durationMs: 6000,
    color: '#f43f5e',
    icon: '🔥',
  },
};

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_flight',
    name: 'First Flight',
    description: 'Complete your very first run in Flappy Chaos.',
    icon: '🐣',
    category: 'games',
    threshold: 1,
  },
  {
    id: 'beginner',
    name: 'Beginner Flyer',
    description: 'Reach a score of 10 points in a single run.',
    icon: '🥉',
    category: 'score',
    threshold: 10,
  },
  {
    id: 'pro_player',
    name: 'Pro Player',
    description: 'Reach a score of 25 points in a single run.',
    icon: '🥈',
    category: 'score',
    threshold: 25,
  },
  {
    id: 'expert',
    name: 'Chaos Expert',
    description: 'Reach a score of 50 points in a single run.',
    icon: '🥇',
    category: 'score',
    threshold: 50,
  },
  {
    id: 'legend',
    name: 'Arcade Legend',
    description: 'Reach a score of 100 points in a single run.',
    icon: '👑',
    category: 'score',
    threshold: 100,
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable God',
    description: 'Score 150 points. You are the ultimate Chaos Master.',
    icon: '⚡',
    category: 'score',
    threshold: 150,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Beat your personal best 5 times.',
    icon: '🎯',
    category: 'streak',
    threshold: 5,
  },
  {
    id: 'addicted',
    name: 'Chaos Addict',
    description: 'Play 50 games of Flappy Chaos.',
    icon: '🎮',
    category: 'games',
    threshold: 50,
  },
  {
    id: 'chaos_survivor',
    name: 'Chaos Survivor',
    description: 'Survive 5 random chaos events in a single run.',
    icon: '🌪️',
    category: 'special',
    threshold: 5,
  },
];

export const DEATH_MESSAGES: Array<{ minScore: number; maxScore: number; messages: string[] }> = [
  {
    minScore: 0,
    maxScore: 0,
    messages: [
      'Bro, did you even try? 😂',
      'The ground says hello!',
      'Gravity: 1, You: 0.',
      'Did your screen freeze or just your thumbs?',
    ],
  },
  {
    minScore: 1,
    maxScore: 9,
    messages: [
      'Getting warmed up! Tap with rhythm!',
      'Just a scratch. Jump right back in!',
      'The pipes are testing your patience!',
      'Almost hit double digits!',
    ],
  },
  {
    minScore: 10,
    maxScore: 24,
    messages: [
      'Getting started! You’re getting the feel!',
      'Nice reflex work! Double digits unlocked!',
      'Solid flight! Keep the composure!',
    ],
  },
  {
    minScore: 25,
    maxScore: 49,
    messages: [
      'Not bad! Real arcade reflexes kicking in!',
      'You are dodging like a champion!',
      'Respectable run! You are threatening the leaderboard!',
    ],
  },
  {
    minScore: 50,
    maxScore: 99,
    messages: [
      'You’re becoming dangerous! 🔥',
      'Top tier reflexes! The chaos cannot stop you!',
      'Phenomenal agility! Keep flying!',
    ],
  },
  {
    minScore: 100,
    maxScore: 999999,
    messages: [
      'ABSOLUTE LEGEND! 👑',
      'GOD MODE ACTIVATED! Leaderboard royalty!',
      'Unstoppable Chaos Conqueror!',
    ],
  },
];

export function getDeathMessage(score: number): string {
  const match = DEATH_MESSAGES.find((d) => score >= d.minScore && score <= d.maxScore);
  if (!match) return 'Great effort! Play again!';
  const randomIndex = Math.floor(Math.random() * match.messages.length);
  return match.messages[randomIndex];
}

export const PHYSICS_PRESETS: Record<GamePhysics['difficulty'], GamePhysics> = {
  casual: {
    gravity: 0.36,
    jumpForce: -7.0,
    pipeSpeed: 2.2,
    pipeSpawnInterval: 125,
    pipeGap: 185,
    difficulty: 'casual',
  },
  arcade: {
    gravity: 0.44,
    jumpForce: -8.0,
    pipeSpeed: 2.8,
    pipeSpawnInterval: 110,
    pipeGap: 160,
    difficulty: 'arcade',
  },
  chaos: {
    gravity: 0.52,
    jumpForce: -8.8,
    pipeSpeed: 3.5,
    pipeSpawnInterval: 95,
    pipeGap: 140,
    difficulty: 'chaos',
  },
};
