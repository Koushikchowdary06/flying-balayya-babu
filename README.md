# 🦁 FLYING BALAYYA BABU – ULTIMATE ARCADE GAMING WEB APP

> **“JAI BALAYYA! ONE TAP. INFINITE CHAOS.”**

**FLYING BALAYYA BABU** is a next-generation, high-performance arcade web gaming platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **HTML5 Canvas** (60 FPS physics engine), backed by **Supabase PostgreSQL & Authentication**, and preloaded with the legendary Nandamuri Balakrishna (God of Masses) flyer avatar and Telugu soundtrack!

---

## 🎮 Features

- **Crazy Gameplay Mechanics**: Full 60 FPS physics engine, dynamic flight rotation, jump acceleration, near-miss combo detection (+2 points bonus), and screen shake.
- **10 Unpredictable Chaos Events**:
  1. `LOW GRAVITY`: Lunar floatation physics
  2. `SUPER SPEED`: 1.85x pipe velocity
  3. `REVERSE GRAVITY`: Ceiling magnetic pull (tap jumps downward!)
  4. `EARTHQUAKE`: Violent screen tremors and dust
  5. `DARK MODE`: Neon blackout with player spotlight
  6. `GIANT MODE`: Colossal flyer scale with higher risk
  7. `MINI MODE`: Micro-scale nimble flyer
  8. `GHOST OBSTACLES`: Obstacles phase into transparency
  9. `BULLET TIME`: Matrix slow-motion reflex test
  10. `ULTIMATE CHAOS`: Combinations of earthquakes, speed, and blackout!
- **Hero & Custom Character Studio**:
  - Preloaded default hero character (Nandamuri Balakrishna)
  - Custom upload support: PNG, JPG, JPEG, WebP
  - Dynamic aspect-ratio maintenance & circular arcade badge
  - Visual aura customization (Glow intensity & color)
  - Particle trails: Fire, Lightning, Rainbow, Neon Gold
  - Persistent browser storage via **IndexedDB**
- **Complete Audio Engine & Studio**:
  - Preloaded default looping background soundtrack (`Nee Kanti Choopulloki`)
  - Web Audio API zero-latency synthesized arcade sound effects (Flap, +1 Score, Death Thud, Chaos Siren, Fanfare)
  - Custom BGM music file uploader (MP3, WAV, OGG)
  - Master, Music, and SFX volume controls
- **Real Global Leaderboards**:
  - Shared across devices via **Supabase PostgreSQL**
  - All-Time, Weekly, and Daily rankings
  - Top 3 podium with Gold Crown, Silver Medal, and Bronze Medal
  - Instant local fallback simulation for offline/guest gameplay
- **Premium Game-Over Scorecard & Social Sharing**:
  - Animated score counter (0 ➔ Score)
  - Dynamic death insults & congratulatory quotes based on performance
  - Automatic confetti explosions for new personal bests
  - Canvas-generated high-resolution shareable scorecard card
  - One-click sharing for WhatsApp, Twitter/X, Native Share, and PNG download
- **Achievements & Badges**:
  - 9 unlockable milestones with live profile badges

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/your-username/flappy-chaos.git
cd flappy-chaos
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
*(Note: If Supabase credentials are not provided, Flappy Chaos automatically operates in local competitive simulation mode so you can play immediately without any configuration!)*

### 4. Database Setup (Supabase)
1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. Copy the entire contents of `supabase/schema.sql`.
4. Run the query. This creates:
   - `profiles` table
   - `scores` table with indexes
   - `player_stats` table
   - `achievements` table
   - Stored procedures for Daily, Weekly, and All-Time leaderboards
   - Secure Row-Level Security (RLS) policies

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel

1. Push your repository to **GitHub**:
```bash
git add .
git commit -m "Flappy Chaos Initial Release"
git push origin main
```
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Select your GitHub repository.
4. Add the Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
5. Click **Deploy**. Your game will be live on a public URL!

---

## 🎨 Custom Assets Setup

- **Default Character**: Stored in `public/assets/default-character.png`.
- **Default Music**: Stored in `public/assets/default-bgm.mp3`.
- Users can replace their character or audio anytime via `/customize` in the application interface.

---

## 🕹️ Controls
- **Desktop**: Press `SPACEBAR` or `UP ARROW` or click the mouse.
- **Mobile / Tablet**: Tap anywhere on the screen.
- **Pause / Resume**: Press `P` key or click the pause button in the HUD.
