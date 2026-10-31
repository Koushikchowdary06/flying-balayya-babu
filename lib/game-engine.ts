import {
  ChaosEvent,
  ChaosEventType,
  CharacterConfig,
  GamePhysics,
  GameScoreResult,
  GameStatus,
  Particle,
  Pipe,
  PlayerProfile,
} from './types';
import {
  CHAOS_EVENT_DEFINITIONS,
  DEFAULT_CHARACTER,
  getDeathMessage,
  PHYSICS_PRESETS,
} from './constants';
import { audioManager } from './audio-manager';
import { getStoredProfile, getUnlockedAchievements, unlockAchievement } from './storage';
import { submitScoreToDatabase } from './leaderboard';

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public status: GameStatus = 'IDLE';
  public score: number = 0;
  public nearMisses: number = 0;
  public chaosEventsSurvived: number = 0;

  // Physics & Settings
  public physics: GamePhysics = { ...PHYSICS_PRESETS.arcade };
  public characterConfig: CharacterConfig = { ...DEFAULT_CHARACTER };

  // Bird / Character State
  public birdX: number = 100;
  public birdY: number = 250;
  public birdVy: number = 0;
  public birdRotation: number = 0;
  public birdWidth: number = 56;
  public birdHeight: number = 56;
  public birdScale: number = 1.0;
  private birdImage: HTMLImageElement | null = null;
  private birdImageLoaded: boolean = false;

  // World & Obstacles
  private pipes: Pipe[] = [];
  private frameCount: number = 0;
  private groundX: number = 0;
  private backgroundX: number = 0;
  private groundHeight: number = 80;

  // Effects & Chaos
  public activeChaosEvent: ChaosEvent | null = null;
  private chaosCooldown: number = 0;
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private screenShakeIntensity: number = 0;
  private screenShakeDecay: number = 0.9;

  // Animation Loop
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Callbacks
  public onScoreChange?: (score: number) => void;
  public onChaosEvent?: (event: ChaosEvent | null) => void;
  public onGameOver?: (result: GameScoreResult) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not available');
    }
    this.ctx = context;
    this.handleResize();
    this.loadCharacterImage(this.characterConfig.imageUrl);
  }

  public setCharacterConfig(config: CharacterConfig) {
    this.characterConfig = config;
    this.loadCharacterImage(config.imageUrl);
  }

  public setPhysics(physics: GamePhysics) {
    this.physics = physics;
  }

  public loadCharacterImage(src: string) {
    this.birdImageLoaded = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.birdImage = img;
      this.birdImageLoaded = true;
    };
    img.onerror = () => {
      console.warn('Could not load character image, falling back');
      this.birdImage = null;
      this.birdImageLoaded = false;
    };
    img.src = src;
  }

  public handleResize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  public getCanvasWidth(): number {
    return this.canvas.width / (window.devicePixelRatio || 1);
  }

  public getCanvasHeight(): number {
    return this.canvas.height / (window.devicePixelRatio || 1);
  }

  public start() {
    this.status = 'PLAYING';
    this.score = 0;
    this.nearMisses = 0;
    this.chaosEventsSurvived = 0;
    this.pipes = [];
    this.particles = [];
    this.floatingTexts = [];
    this.activeChaosEvent = null;
    this.chaosCooldown = 280; // Trigger first chaos around 5-6 pipes
    this.frameCount = 0;

    const width = this.getCanvasWidth();
    const height = this.getCanvasHeight();
    this.birdX = Math.min(120, width * 0.25);
    this.birdY = height * 0.4;
    this.birdVy = 0;
    this.birdRotation = 0;
    this.birdScale = 1.0;

    audioManager.startBgm();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public flap() {
    if (this.status !== 'PLAYING') {
      if (this.status === 'IDLE' || this.status === 'GAME_OVER') {
        this.start();
      }
      return;
    }

    const jumpMagnitude = this.physics.jumpForce;
    this.birdVy = jumpMagnitude;
    this.birdRotation = -0.42;

    // Emit jump ring particles
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.birdX - 8,
        y: this.birdY + 14,
        vx: (Math.random() - 0.5) * 3 - 2,
        vy: (Math.random() - 0.5) * 2 + 1,
        size: Math.random() * 4 + 2,
        color: this.characterConfig.auraColor || '#fbbf24',
        alpha: 0.9,
        life: 0,
        maxLife: 18,
      });
    }

    audioManager.playTapSound();
  }

  private triggerRandomChaos() {
    const events: ChaosEventType[] = [
      'LOW_GRAVITY',
      'SUPER_SPEED',
      'REVERSE_GRAVITY',
      'EARTHQUAKE',
      'DARK_MODE',
      'GIANT_MODE',
      'MINI_MODE',
      'INVISIBLE_OBSTACLES',
      'SLOW_MOTION',
      'CHAOS_MODE',
    ];

    const pick = events[Math.floor(Math.random() * events.length)];
    const def = CHAOS_EVENT_DEFINITIONS[pick];

    this.activeChaosEvent = {
      type: pick,
      name: def.name,
      description: def.description,
      durationMs: def.durationMs,
      remainingMs: def.durationMs,
      color: def.color,
      icon: def.icon,
    };

    if (pick === 'EARTHQUAKE' || pick === 'CHAOS_MODE') {
      this.screenShakeIntensity = 12;
    }

    audioManager.playChaosEventSound();

    if (this.onChaosEvent) {
      this.onChaosEvent(this.activeChaosEvent);
    }

    this.addFloatingText(`⚠️ ${def.name}!`, this.birdX + 40, this.birdY - 30, def.color);
  }

  private endChaosEvent() {
    if (this.activeChaosEvent) {
      this.chaosEventsSurvived += 1;
      this.activeChaosEvent = null;
      this.birdScale = 1.0;
      if (this.onChaosEvent) {
        this.onChaosEvent(null);
      }
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#ffffff') {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      alpha: 1.0,
      vy: -1.8,
    });
  }

  private spawnPipe() {
    const width = this.getCanvasWidth();
    const height = this.getCanvasHeight();
    const effectiveGround = height - this.groundHeight;

    const gap = this.physics.pipeGap;
    const minHeight = 60;
    const maxHeight = effectiveGround - gap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    const bottomY = topHeight + gap;
    const bottomHeight = effectiveGround - bottomY;

    this.pipes.push({
      x: width + 20,
      topHeight,
      bottomY,
      bottomHeight,
      width: 64,
      passed: false,
    });
  }

  private emitTrailParticles() {
    const trail = this.characterConfig.trailType;
    if (trail === 'none') return;

    const count = trail === 'fire' || trail === 'lightning' ? 3 : 2;
    for (let i = 0; i < count; i++) {
      let color = this.characterConfig.auraColor;
      let shape: 'circle' | 'spark' | 'star' = 'circle';
      let size = Math.random() * 5 + 3;

      if (trail === 'fire') {
        const fireColors = ['#ef4444', '#f97316', '#eab308', '#ffffff'];
        color = fireColors[Math.floor(Math.random() * fireColors.length)];
        shape = 'circle';
      } else if (trail === 'lightning') {
        const electric = ['#38bdf8', '#818cf8', '#c084fc', '#ffffff'];
        color = electric[Math.floor(Math.random() * electric.length)];
        shape = 'spark';
      } else if (trail === 'rainbow') {
        const rainbow = ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#fbbf24'];
        color = rainbow[Math.floor(Math.random() * rainbow.length)];
        shape = 'star';
      } else if (trail === 'neon_gold') {
        color = Math.random() > 0.4 ? '#fbbf24' : '#ffffff';
        shape = 'star';
        size = Math.random() * 6 + 2;
      }

      this.particles.push({
        x: this.birdX - 10 + (Math.random() - 0.5) * 8,
        y: this.birdY + (Math.random() - 0.5) * 12,
        vx: -3 - Math.random() * 3,
        vy: (Math.random() - 0.5) * 2,
        size,
        color,
        alpha: 0.95,
        life: 0,
        maxLife: 25,
        shape,
      });
    }
  }

  private update(delta: number) {
    if (this.status !== 'PLAYING') return;

    this.frameCount++;
    const height = this.getCanvasHeight();
    const effectiveGround = height - this.groundHeight;

    // Smooth, consistent physics
    const currentGravity = this.physics.gravity;
    const currentPipeSpeed = this.physics.pipeSpeed;

    // Bird Velocity & Position
    this.birdVy += currentGravity;
    this.birdY += this.birdVy;

    // Bird Rotation
    if (this.birdVy < 0) {
      this.birdRotation = Math.max(-0.45, this.birdRotation - 0.06);
    } else {
      this.birdRotation = Math.min(1.1, this.birdRotation + 0.035);
    }

    // Ground and Ceiling collision
    const birdRadius = (this.birdWidth / 2) * this.birdScale * 0.72;
    if (this.birdY + birdRadius >= effectiveGround) {
      this.birdY = effectiveGround - birdRadius;
      this.die('hit_ground');
      return;
    }
    if (this.birdY - birdRadius <= 0) {
      this.birdY = birdRadius;
      this.birdVy = 0; // Soft bounce at ceiling rather than death
    }

    // Background scrolling
    this.backgroundX = (this.backgroundX - currentPipeSpeed * 0.3) % 400;
    this.groundX = (this.groundX - currentPipeSpeed) % 40;

    // Trail particles
    this.emitTrailParticles();

    // Spawn pipes
    if (this.frameCount % this.physics.pipeSpawnInterval === 0) {
      this.spawnPipe();
    }

    // Move & check pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      p.x -= currentPipeSpeed;

      // Pipe passed check
      if (!p.passed && p.x + p.width < this.birdX) {
        p.passed = true;
        this.score += 1;
        audioManager.playScoreSound();
        this.addFloatingText('+1', this.birdX + 25, this.birdY - 20, '#10b981');
        if (this.onScoreChange) {
          this.onScoreChange(this.score);
        }
      }

      // Near-miss detection
      const closeHorizontal = Math.abs(this.birdX - (p.x + p.width / 2)) < p.width / 2 + birdRadius + 6;
      const nearTopPipe = Math.abs(this.birdY - birdRadius - p.topHeight) < 8;
      const nearBottomPipe = Math.abs(this.birdY + birdRadius - p.bottomY) < 8;
      if (closeHorizontal && (nearTopPipe || nearBottomPipe) && !p.highlighted) {
        p.highlighted = true;
        this.nearMisses += 1;
        audioManager.playNearMissSound();
        this.addFloatingText('🔥 NEAR MISS! +2', this.birdX + 20, this.birdY - 35, '#fbbf24');
        this.score += 2;
        if (this.onScoreChange) {
          this.onScoreChange(this.score);
        }
      }

      // Pipe collision detection
      const withinX = this.birdX + birdRadius > p.x && this.birdX - birdRadius < p.x + p.width;
      if (withinX) {
        const hitTop = this.birdY - birdRadius < p.topHeight;
        const hitBottom = this.birdY + birdRadius > p.bottomY;
        if (hitTop || hitBottom) {
          this.die('hit_pipe');
          return;
        }
      }

      // Remove offscreen pipes
      if (p.x + p.width < -50) {
        this.pipes.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life += 1;
      pt.alpha = 1 - pt.life / pt.maxLife;
      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Screen Shake Decay
    if (this.screenShakeIntensity > 0.1) {
      this.screenShakeIntensity *= this.screenShakeDecay;
    } else {
      this.screenShakeIntensity = 0;
    }
  }

  private async die(_reason: string) {
    this.status = 'DYING';
    audioManager.stopBgm();
    audioManager.playDeathSound();

    this.screenShakeIntensity = 18;

    // Collision explosion particles
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      this.particles.push({
        x: this.birdX,
        y: this.birdY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: ['#ef4444', '#f97316', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 4)],
        alpha: 1.0,
        life: 0,
        maxLife: 40,
        shape: 'spark',
      });
    }

    const profile = getStoredProfile();
    const previousBest = profile.bestScore;

    // Check & unlock achievements
    const unlocked: string[] = [];
    if (this.score >= 10) unlockAchievement('beginner');
    if (this.score >= 25) unlockAchievement('pro_player');
    if (this.score >= 50) unlockAchievement('expert');
    if (this.score >= 100) unlockAchievement('legend');
    if (this.score >= 150) unlockAchievement('unstoppable');
    if (profile.totalGames === 0) unlockAchievement('first_flight');
    if (profile.totalGames + 1 >= 50) unlockAchievement('addicted');
    if (this.chaosEventsSurvived >= 5) unlockAchievement('chaos_survivor');

    // Submit to database & get ranks
    const { globalRank, dailyRank, weeklyRank, isNewBest } = await submitScoreToDatabase(
      this.score,
      this.chaosEventsSurvived
    );

    const deathMessage = getDeathMessage(this.score);
    const achievementsList = getUnlockedAchievements().filter((a) => !!a.unlockedAt);

    this.status = 'GAME_OVER';

    if (this.onGameOver) {
      this.onGameOver({
        score: this.score,
        personalBest: Math.max(previousBest, this.score),
        previousBest,
        isNewBest,
        chaosEventsSurvived: this.chaosEventsSurvived,
        nearMisses: this.nearMisses,
        globalRank,
        dailyRank,
        weeklyRank,
        deathMessage,
        unlockedAchievements: achievementsList,
      });
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(0.5, '#1e1b4b');
    skyGrad.addColorStop(1, '#2e1065');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Cyberpunk Stars / Grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 137) % width);
      const sy = ((i * 89) % (height - 150));
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Neon Skyline Silhouettes (Parallax)
    ctx.fillStyle = '#140c2b';
    const buildingWidth = 60;
    const offset = this.backgroundX;
    for (let x = -buildingWidth; x < width + buildingWidth; x += buildingWidth) {
      const bHeight = 80 + ((Math.abs(Math.sin((x + offset) * 0.02)) * 120));
      ctx.fillRect(x + (offset % buildingWidth), height - this.groundHeight - bHeight, buildingWidth - 6, bHeight);
    }

    // Moving Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    const cloudOffset = (this.frameCount * 0.5) % (width + 200);
    ctx.beginPath();
    ctx.arc(width - cloudOffset + 100, 80, 45, 0, Math.PI * 2);
    ctx.arc(width - cloudOffset + 140, 70, 55, 0, Math.PI * 2);
    ctx.arc(width - cloudOffset + 180, 85, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPipes(ctx: CanvasRenderingContext2D) {
    this.pipes.forEach((p) => {
      ctx.save();

      // Neon Gradient for Pipes
      const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
      if (p.highlighted) {
        pipeGrad.addColorStop(0, '#f59e0b');
        pipeGrad.addColorStop(0.5, '#fef08a');
        pipeGrad.addColorStop(1, '#d97706');
      } else {
        pipeGrad.addColorStop(0, '#059669');
        pipeGrad.addColorStop(0.4, '#10b981');
        pipeGrad.addColorStop(0.8, '#34d399');
        pipeGrad.addColorStop(1, '#047857');
      }

      ctx.fillStyle = pipeGrad;
      ctx.strokeStyle = p.highlighted ? '#fbbf24' : '#6ee7b7';
      ctx.lineWidth = 3;

      // Top Pipe
      ctx.fillRect(p.x, 0, p.width, p.topHeight);
      ctx.strokeRect(p.x, 0, p.width, p.topHeight);

      // Top Cap
      ctx.fillStyle = p.highlighted ? '#fbbf24' : '#34d399';
      ctx.fillRect(p.x - 4, p.topHeight - 20, p.width + 8, 20);
      ctx.strokeRect(p.x - 4, p.topHeight - 20, p.width + 8, 20);

      // Bottom Pipe
      ctx.fillStyle = pipeGrad;
      ctx.fillRect(p.x, p.bottomY, p.width, p.bottomHeight);
      ctx.strokeRect(p.x, p.bottomY, p.width, p.bottomHeight);

      // Bottom Cap
      ctx.fillStyle = p.highlighted ? '#fbbf24' : '#34d399';
      ctx.fillRect(p.x - 4, p.bottomY, p.width + 8, 20);
      ctx.strokeRect(p.x - 4, p.bottomY, p.width + 8, 20);

      ctx.restore();
    });
  }

  private drawGround(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const groundY = height - this.groundHeight;

    // Cyberpunk Neon Ground
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
    groundGrad.addColorStop(0, '#111827');
    groundGrad.addColorStop(1, '#030712');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, width, this.groundHeight);

    // Neon Border Stripe
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Speed Grid Lines
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
    ctx.lineWidth = 2;
    for (let x = this.groundX; x < width + 40; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 20, height);
      ctx.stroke();
    }
  }

  private drawCharacter(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.birdX, this.birdY);
    ctx.rotate(this.birdRotation);

    const size = this.birdWidth * this.birdScale * this.characterConfig.scale;
    const half = size / 2;

    // Glowing Neon Aura
    ctx.shadowColor = this.characterConfig.auraColor || '#fbbf24';
    ctx.shadowBlur = this.characterConfig.glowIntensity || 20;

    if (this.birdImage && this.birdImageLoaded) {
      const imgW = this.birdImage.naturalWidth || this.birdImage.width;
      const imgH = this.birdImage.naturalHeight || this.birdImage.height;
      const sSize = Math.min(imgW, imgH);
      let sx = (imgW - sSize) / 2;
      let sy = 0;

      // Smart crop: portrait photos keep face centered from top
      if (imgH > imgW * 1.1) {
        sy = Math.max(0, Math.min(imgH - sSize, imgH * 0.05));
      } else if (imgH < imgW) {
        sx = (imgW - sSize) / 2;
        sy = (imgH - sSize) / 2;
      }

      if (this.characterConfig.shape === 'raw') {
        // Direct image rendering
        ctx.drawImage(this.birdImage, sx, sy, sSize, sSize, -half, -half, size, size);
      } else {
        // High-contrast Circular Arcade Badge for Balayya
        ctx.beginPath();
        ctx.arc(0, 0, half, 0, Math.PI * 2);
        ctx.closePath();
        ctx.save();
        ctx.clip();

        // Draw image perfectly centered on face & aspect ratio preserved
        ctx.drawImage(this.birdImage, sx, sy, sSize, sSize, -half, -half, size, size);
        ctx.restore();

        // Outer contrast outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, half, 0, Math.PI * 2);
        ctx.stroke();

        // Glowing Neon Gold Ring
        ctx.strokeStyle = this.characterConfig.auraColor || '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, half, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Fallback Hero Avatar Badge (Golden Cyber Phoenix)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, half, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(half * 0.35, -half * 0.2, half * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(half * 0.45, -half * 0.2, half * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.shape === 'spark') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.shape === 'star') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private drawFloatingTexts(ctx: CanvasRenderingContext2D) {
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  private drawDarkSpotlight(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (this.activeChaosEvent?.type !== 'DARK_MODE') return;

    ctx.save();
    const radius = 130;
    const grad = ctx.createRadialGradient(
      this.birdX,
      this.birdY,
      20,
      this.birdX,
      this.birdY,
      radius
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0.96)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  public render() {
    const width = this.getCanvasWidth();
    const height = this.getCanvasHeight();

    this.ctx.save();

    // Screen Shake
    if (this.screenShakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.screenShakeIntensity;
      const sy = (Math.random() - 0.5) * this.screenShakeIntensity;
      this.ctx.translate(sx, sy);
    }

    // Clear
    this.ctx.clearRect(0, 0, width, height);

    // 1. Background
    this.drawBackground(this.ctx, width, height);

    // 2. Pipes
    this.drawPipes(this.ctx);

    // 3. Ground
    this.drawGround(this.ctx, width, height);

    // 4. Particles
    this.drawParticles(this.ctx);

    // 5. Character
    this.drawCharacter(this.ctx);

    // 6. Floating Texts
    this.drawFloatingTexts(this.ctx);

    this.ctx.restore();
  }

  private loop = (timestamp: number) => {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(delta);
    this.render();

    if (this.status === 'PLAYING' || this.status === 'DYING') {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  };

  public destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    audioManager.stopBgm();
  }
}
