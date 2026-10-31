-- ========================================================
-- FLAPPY CHAOS: SUPABASE POSTGRESQL DATABASE SCHEMA
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. SCORES TABLE (Verified gameplay submissions)
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    chaos_events_survived INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. PLAYER_STATS TABLE (Aggregated metrics)
CREATE TABLE IF NOT EXISTS public.player_stats (
    player_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    best_score INTEGER DEFAULT 0 NOT NULL,
    total_games INTEGER DEFAULT 0 NOT NULL,
    total_score BIGINT DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    threshold INTEGER NOT NULL
);

-- 5. PLAYER_ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(player_id, achievement_id)
);

-- Seed default achievements
INSERT INTO public.achievements (id, name, description, category, icon, threshold) VALUES
('first_flight', 'First Flight', 'Complete your very first game in Flappy Chaos.', 'games', '🐣', 1),
('beginner', 'Beginner Flyer', 'Score 10 or more points in a single run.', 'score', '🥉', 10),
('pro_player', 'Pro Player', 'Score 25 or more points in a single run.', 'score', '🥈', 25),
('expert', 'Chaos Expert', 'Score 50 or more points in a single run.', 'score', '🥇', 50),
('legend', 'Arcade Legend', 'Score 100 or more points in a single run.', 'score', '👑', 100),
('unstoppable', 'Unstoppable God', 'Score 150 points. You have mastered the chaos.', 'score', '⚡', 150),
('perfectionist', 'Perfectionist', 'Beat your personal best 5 times.', 'streak', '🎯', 5),
('addicted', 'Chaos Addict', 'Play 50 games of Flappy Chaos.', 'games', '🎮', 5),
('chaos_survivor', 'Chaos Survivor', 'Survive 10 random chaos events in a single run.', 'special', '🌪️', 10)
ON CONFLICT (id) DO NOTHING;

-- INDEXES FOR MAXIMUM LEADERBOARD PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_scores_score ON public.scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON public.scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scores_player_id ON public.scores(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_best_score ON public.player_stats(best_score DESC);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view all profiles; users can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Scores: Public can view scores; authenticated users can insert verified scores
CREATE POLICY "Scores are viewable by everyone" ON public.scores
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert scores" ON public.scores
    FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Player Stats: Public can view; system / authenticated users can upsert
CREATE POLICY "Player stats viewable by everyone" ON public.player_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can update own stats" ON public.player_stats
    FOR UPDATE USING (auth.uid() = player_id);

CREATE POLICY "Users can insert own stats" ON public.player_stats
    FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Achievements: Public can view achievements
CREATE POLICY "Achievements viewable by everyone" ON public.achievements
    FOR SELECT USING (true);

CREATE POLICY "Player achievements viewable by everyone" ON public.player_achievements
    FOR SELECT USING (true);

CREATE POLICY "Users can unlock their own achievements" ON public.player_achievements
    FOR INSERT WITH CHECK (auth.uid() = player_id);

-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', '/assets/default-avatar.png')
    );

    INSERT INTO public.player_stats (player_id, best_score, total_games, total_score)
    VALUES (new.id, 0, 0, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- LEADERBOARD STORED PROCEDURES
-- Get All Time Top Leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard_all_time(limit_count INT DEFAULT 100)
RETURNS TABLE (
    rank BIGINT,
    player_id UUID,
    username TEXT,
    avatar_url TEXT,
    best_score INT,
    total_games INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY ps.best_score DESC, ps.updated_at ASC) as rank,
        p.id as player_id,
        p.username,
        p.avatar_url,
        ps.best_score,
        ps.total_games
    FROM public.player_stats ps
    JOIN public.profiles p ON p.id = ps.player_id
    WHERE ps.best_score > 0
    ORDER BY ps.best_score DESC, ps.updated_at ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Weekly Leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard_weekly(limit_count INT DEFAULT 100)
RETURNS TABLE (
    rank BIGINT,
    player_id UUID,
    username TEXT,
    avatar_url TEXT,
    best_score INT,
    score_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH weekly_scores AS (
        SELECT 
            s.player_id,
            MAX(s.score) as max_score,
            MAX(s.created_at) as latest_at
        FROM public.scores s
        WHERE s.created_at >= (NOW() - INTERVAL '7 days')
        GROUP BY s.player_id
    )
    SELECT 
        ROW_NUMBER() OVER (ORDER BY ws.max_score DESC, ws.latest_at ASC) as rank,
        p.id as player_id,
        p.username,
        p.avatar_url,
        ws.max_score as best_score,
        ws.latest_at as score_date
    FROM weekly_scores ws
    JOIN public.profiles p ON p.id = ws.player_id
    ORDER BY ws.max_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Daily Leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard_daily(limit_count INT DEFAULT 100)
RETURNS TABLE (
    rank BIGINT,
    player_id UUID,
    username TEXT,
    avatar_url TEXT,
    best_score INT,
    score_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_scores AS (
        SELECT 
            s.player_id,
            MAX(s.score) as max_score,
            MAX(s.created_at) as latest_at
        FROM public.scores s
        WHERE s.created_at >= (NOW() - INTERVAL '24 hours')
        GROUP BY s.player_id
    )
    SELECT 
        ROW_NUMBER() OVER (ORDER BY ds.max_score DESC, ds.latest_at ASC) as rank,
        p.id as player_id,
        p.username,
        p.avatar_url,
        ds.max_score as best_score,
        ds.latest_at as score_date
    FROM daily_scores ds
    JOIN public.profiles p ON p.id = ds.player_id
    ORDER BY ds.max_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
