-- ============================================================================
-- SIGARA BIRAK - SUPABASE DATABASE SCHEMA (IDEMPOTENT VERSION)
-- Tüm tablolar, ilişkiler, RLS politikaları ve fonksiyonlar
-- ============================================================================

-- ============================================================================
-- 0. ÖN AYARLAR
-- ============================================================================

-- UUID extension etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Updated_at fonksiyonu (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 1. KULLANICI PROFILLERI
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger (önce varsa sil sonra oluştur)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- SELECT policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Kullanıcılar kendi profillerini görebilir') THEN
        CREATE POLICY "Kullanıcılar kendi profillerini görebilir"
            ON profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    
    -- UPDATE policy  
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Kullanıcılar kendi profillerini güncelleyebilir') THEN
        CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
            ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    -- INSERT policy (yeni eklenen)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Sistem yeni profil oluşturabilir') THEN
        CREATE POLICY "Sistem yeni profil oluşturabilir"
            ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- ============================================================================
-- 2. SIGARA BIRAKMA BILGILERI
-- ============================================================================

CREATE TABLE IF NOT EXISTS quit_smoking_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    cigarettes_per_day INTEGER NOT NULL DEFAULT 15,
    price_per_pack DECIMAL(10,2) NOT NULL DEFAULT 42.00,
    cigarettes_per_pack INTEGER DEFAULT 20,
    quit_reason TEXT,
    previous_attempts INTEGER DEFAULT 0,
    motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 10),
    triggers TEXT[],
    support_system TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

DROP TRIGGER IF EXISTS update_quit_info_updated_at ON quit_smoking_info;
CREATE TRIGGER update_quit_info_updated_at
    BEFORE UPDATE ON quit_smoking_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE quit_smoking_info ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quit_smoking_info' AND policyname = 'Kullanıcılar kendi bırakma bilgilerini görebilir') THEN
        CREATE POLICY "Kullanıcılar kendi bırakma bilgilerini görebilir"
            ON quit_smoking_info FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quit_smoking_info' AND policyname = 'Kullanıcılar kendi bırakma bilgilerini yönetebilir') THEN
        CREATE POLICY "Kullanıcılar kendi bırakma bilgilerini yönetebilir"
            ON quit_smoking_info FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 3. GUNLUK CHECK-INLER
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    smoked BOOLEAN DEFAULT FALSE,
    craving_level INTEGER CHECK (craving_level BETWEEN 1 AND 10),
    mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, checkin_date)
);

ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_checkins' AND policyname = 'Kullanıcılar kendi check-inlerini görebilir') THEN
        CREATE POLICY "Kullanıcılar kendi check-inlerini görebilir"
            ON daily_checkins FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_checkins' AND policyname = 'Kullanıcılar kendi check-inlerini yönetebilir') THEN
        CREATE POLICY "Kullanıcılar kendi check-inlerini yönetebilir"
            ON daily_checkins FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_checkins_user ON daily_checkins(user_id, checkin_date DESC);

-- ============================================================================
-- 4. RUH HALI KAYITLARI (MOOD TRACKING)
-- ============================================================================

CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    mood_level INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 10),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, entry_date)
);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_entries' AND policyname = 'Kullanıcılar kendi ruh hali kayıtlarını görebilir') THEN
        CREATE POLICY "Kullanıcılar kendi ruh hali kayıtlarını görebilir"
            ON mood_entries FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mood_entries' AND policyname = 'Kullanıcılar kendi ruh hali kayıtlarını yönetebilir') THEN
        CREATE POLICY "Kullanıcılar kendi ruh hali kayıtlarını yönetebilir"
            ON mood_entries FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mood_user ON mood_entries(user_id, entry_date DESC);

-- ============================================================================
-- 5. GUNLUK GIRISLER (JOURNAL)
-- ============================================================================

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    content TEXT NOT NULL,
    prompt TEXT,
    tags TEXT[],
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_journal_updated_at ON journal_entries;
CREATE TRIGGER update_journal_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'journal_entries' AND policyname = 'Kullanıcılar kendi günlüklerini görebilir') THEN
        CREATE POLICY "Kullanıcılar kendi günlüklerini görebilir"
            ON journal_entries FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'journal_entries' AND policyname = 'Kullanıcılar kendi günlüklerini yönetebilir') THEN
        CREATE POLICY "Kullanıcılar kendi günlüklerini yönetebilir"
            ON journal_entries FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id, entry_date DESC);

-- ============================================================================
-- 6. BASARIMLAR (ACHIEVEMENTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    day_threshold INTEGER NOT NULL,
    is_new BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, achievement_type)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Kullanıcılar kendi başarımlarını görebilir') THEN
        CREATE POLICY "Kullanıcılar kendi başarımlarını görebilir"
            ON achievements FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Sadece sistem başarım ekleyebilir') THEN
        CREATE POLICY "Sadece sistem başarım ekleyebilir"
            ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id, earned_at DESC);

-- ============================================================================
-- 7. AKTIVITELER (ACTIVITIES)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    icon TEXT DEFAULT '✓',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'Kullanıcılar kendi aktivitelerini görebilir') THEN
        CREATE POLICY "Kullanıcılar kendi aktivitelerini görebilir"
            ON activities FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'Kullanıcılar kendi aktivitelerini ekleyebilir') THEN
        CREATE POLICY "Kullanıcılar kendi aktivitelerini ekleyebilir"
            ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- YENI: Trigger için INSERT policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'Sistem yeni aktivite oluşturabilir') THEN
        CREATE POLICY "Sistem yeni aktivite oluşturabilir"
            ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id, created_at DESC);

-- ============================================================================
-- 8. TOPLULUK GONDERILERI
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'general' CHECK (post_type IN ('general', 'milestone', 'struggle', 'victory', 'question')),
    days_smoke_free INTEGER,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_posts_updated_at ON community_posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Herkes gönderileri görebilir') THEN
        CREATE POLICY "Herkes gönderileri görebilir"
            ON community_posts FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'Kullanıcılar kendi gönderilerini yönetebilir') THEN
        CREATE POLICY "Kullanıcılar kendi gönderilerini yönetebilir"
            ON community_posts FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_type ON community_posts(post_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user ON community_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON community_posts(is_pinned) WHERE is_pinned = TRUE;

-- ============================================================================
-- 9. GONDERI BEGENILERI
-- ============================================================================

CREATE TABLE IF NOT EXISTS post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Herkes beğenileri görebilir') THEN
        CREATE POLICY "Herkes beğenileri görebilir"
            ON post_likes FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_likes' AND policyname = 'Kullanıcılar beğeni ekleyip silebilir') THEN
        CREATE POLICY "Kullanıcılar beğeni ekleyip silebilir"
            ON post_likes FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_likes_post ON post_likes(post_id);

-- Beğeni sayısını otomatik güncelle
CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_likes_count ON post_likes;
CREATE TRIGGER update_post_likes_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_likes_count();

-- ============================================================================
-- 10. YORUMLAR
-- ============================================================================

CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_comments_updated_at ON post_comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Herkes yorumları görebilir') THEN
        CREATE POLICY "Herkes yorumları görebilir"
            ON post_comments FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'post_comments' AND policyname = 'Kullanıcılar kendi yorumlarını yönetebilir') THEN
        CREATE POLICY "Kullanıcılar kendi yorumlarını yönetebilir"
            ON post_comments FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_comments_post ON post_comments(post_id, created_at);

-- Yorum sayısını güncelle
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_comments_count ON post_comments;
CREATE TRIGGER update_post_comments_count
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comments_count();

-- ============================================================================
-- 11. KULLANICI AYARLARI
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    daily_reminder BOOLEAN DEFAULT true,
    milestone_notifications BOOLEAN DEFAULT true,
    reminder_time TIME DEFAULT '09:00:00',
    dark_mode BOOLEAN DEFAULT false,
    compact_mode BOOLEAN DEFAULT false,
    language VARCHAR(5) DEFAULT 'tr',
    two_factor_enabled BOOLEAN DEFAULT false,
    biometric_login BOOLEAN DEFAULT false,
    privacy_show_progress BOOLEAN DEFAULT true,
    privacy_show_savings BOOLEAN DEFAULT true,
    privacy_anonymous_posts BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

DROP TRIGGER IF EXISTS update_settings_updated_at ON user_settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Kullanıcılar kendi ayarlarını görebilir') THEN
        CREATE POLICY "Kullanıcılar kendi ayarlarını görebilir"
            ON user_settings FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Kullanıcılar kendi ayarlarını güncelleyebilir') THEN
        CREATE POLICY "Kullanıcılar kendi ayarlarını güncelleyebilir"
            ON user_settings FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    -- YENI: Trigger için INSERT policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_settings' AND policyname = 'Sistem yeni ayarlar oluşturabilir') THEN
        CREATE POLICY "Sistem yeni ayarlar oluşturabilir"
            ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 12. BILDIRIMLER
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'achievement')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Kullanıcılar kendi bildirimlerini görebilir') THEN
        CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir"
            ON notifications FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Kullanıcılar bildirim durumunu güncelleyebilir') THEN
        CREATE POLICY "Kullanıcılar bildirim durumunu güncelleyebilir"
            ON notifications FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    -- YENI: Trigger için INSERT policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Sistem yeni bildirim oluşturabilir') THEN
        CREATE POLICY "Sistem yeni bildirim oluşturabilir"
            ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- 13. DEVICE TOKENS (Push Notifications için)
-- ============================================================================

CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_type VARCHAR(20) CHECK (device_type IN ('ios', 'android', 'web')),
    device_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'device_tokens' AND policyname = 'Kullanıcılar kendi cihaz tokenlerini yönetebilir') THEN
        CREATE POLICY "Kullanıcılar kendi cihaz tokenlerini yönetebilir"
            ON device_tokens FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON device_tokens(user_id, is_active);

-- ============================================================================
-- 14. SOS KAYITLARI (Acil Yardım Kullanımı)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sos_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    technique_used TEXT,
    success BOOLEAN,
    craving_level_before INTEGER,
    craving_level_after INTEGER,
    notes TEXT
);

ALTER TABLE sos_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sos_logs' AND policyname = 'Kullanıcılar kendi SOS kayıtlarını görebilir') THEN
        CREATE POLICY "Kullanıcılar kendi SOS kayıtlarını görebilir"
            ON sos_logs FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sos_logs' AND policyname = 'Kullanıcılar SOS kaydı ekleyebilir') THEN
        CREATE POLICY "Kullanıcılar SOS kaydı ekleyebilir"
            ON sos_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sos_user ON sos_logs(user_id, triggered_at DESC);

-- ============================================================================
-- VIEWS (Görünümler)
-- ============================================================================

-- Kullanıcı ilerleme özeti
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT 
    p.id as user_id,
    p.email,
    q.quit_date,
    EXTRACT(DAY FROM NOW() - q.quit_date) as days_smoke_free,
    q.cigarettes_per_day,
    q.price_per_pack,
    FLOOR(EXTRACT(DAY FROM NOW() - q.quit_date) * q.cigarettes_per_day) as cigarettes_not_smoked,
    FLOOR((EXTRACT(DAY FROM NOW() - q.quit_date) * q.cigarettes_per_day / 20) * q.price_per_pack) as money_saved,
    (SELECT COUNT(*) FROM achievements WHERE user_id = p.id) as achievements_count,
    (SELECT COUNT(*) FROM journal_entries WHERE user_id = p.id) as journal_entries_count,
    (SELECT COUNT(*) FROM daily_checkins WHERE user_id = p.id AND checkin_date >= CURRENT_DATE - INTERVAL '7 days') as weekly_checkins
FROM profiles p
LEFT JOIN quit_smoking_info q ON p.id = q.user_id;

-- Topluluk liderlik tablosu
CREATE OR REPLACE VIEW community_leaderboard AS
SELECT 
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    EXTRACT(DAY FROM NOW() - q.quit_date) as days_smoke_free,
    (SELECT COUNT(*) FROM achievements WHERE user_id = p.id) as achievements_count,
    (SELECT COUNT(*) FROM community_posts WHERE user_id = p.id) as posts_count,
    (SELECT SUM(likes_count) FROM community_posts WHERE user_id = p.id) as total_likes
FROM profiles p
LEFT JOIN quit_smoking_info q ON p.id = q.user_id
WHERE q.quit_date IS NOT NULL
ORDER BY days_smoke_free DESC;

-- ============================================================================
-- STORED PROCEDURES (Saklı Prosedürler)
-- ============================================================================

-- Başarım kontrolü ve ekleme
CREATE OR REPLACE FUNCTION check_and_add_achievements(user_uuid UUID)
RETURNS TABLE(achievement_type TEXT, title TEXT) AS $$
DECLARE
    days_smoke_free INTEGER;
    existing_achievements TEXT[];
BEGIN
    SELECT EXTRACT(DAY FROM NOW() - quit_date)::INTEGER
    INTO days_smoke_free
    FROM quit_smoking_info
    WHERE user_id = user_uuid;

    SELECT array_agg(a.achievement_type)
    INTO existing_achievements
    FROM achievements a
    WHERE a.user_id = user_uuid;

    IF days_smoke_free >= 1 AND NOT ('first_day' = ANY(COALESCE(existing_achievements, ARRAY[]::TEXT[]))) THEN
        INSERT INTO achievements (user_id, achievement_type, title, description, icon, day_threshold)
        VALUES (user_uuid, 'first_day', 'İlk Adım', 'Sigara bırakma yolculuğunun ilk günü!', '🌟', 1);
        RETURN QUERY SELECT 'first_day'::TEXT, 'İlk Adım'::TEXT;
    END IF;

    IF days_smoke_free >= 7 AND NOT ('one_week' = ANY(COALESCE(existing_achievements, ARRAY[]::TEXT[]))) THEN
        INSERT INTO achievements (user_id, achievement_type, title, description, icon, day_threshold)
        VALUES (user_uuid, 'one_week', '1 Hafta', 'İlk haftayı başarıyla tamamladın!', '🔥', 7);
        RETURN QUERY SELECT 'one_week'::TEXT, '1 Hafta'::TEXT;
    END IF;

    IF days_smoke_free >= 30 AND NOT ('one_month' = ANY(COALESCE(existing_achievements, ARRAY[]::TEXT[]))) THEN
        INSERT INTO achievements (user_id, achievement_type, title, description, icon, day_threshold)
        VALUES (user_uuid, 'one_month', '1 Ay', '30 gün sigarasız! Muhteşem!', '🏆', 30);
        RETURN QUERY SELECT 'one_month'::TEXT, '1 Ay'::TEXT;
    END IF;

    IF days_smoke_free >= 100 AND NOT ('hundred_days' = ANY(COALESCE(existing_achievements, ARRAY[]::TEXT[]))) THEN
        INSERT INTO achievements (user_id, achievement_type, title, description, icon, day_threshold)
        VALUES (user_uuid, 'hundred_days', '100 Gün', '100 gün sigarasız! Harika bir başarı!', '💯', 100);
        RETURN QUERY SELECT 'hundred_days'::TEXT, '100 Gün'::TEXT;
    END IF;

    IF days_smoke_free >= 365 AND NOT ('one_year' = ANY(COALESCE(existing_achievements, ARRAY[]::TEXT[]))) THEN
        INSERT INTO achievements (user_id, achievement_type, title, description, icon, day_threshold)
        VALUES (user_uuid, 'one_year', '1 Yıl', 'Tam 1 yıl sigarasız! Sen bir kahramansın!', '🏅', 365);
        RETURN QUERY SELECT 'one_year'::TEXT, '1 Yıl'::TEXT;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Kullanıcı kaydı sonrası otomatik profil oluşturma
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NOW(), NOW());
    
    INSERT INTO user_settings (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW());
    
    INSERT INTO activities (user_id, activity_type, message, icon, created_at)
    VALUES (NEW.id, 'signup', 'Sigara Bırak uygulamasına hoş geldin!', '🎉', NOW());
    
    INSERT INTO notifications (user_id, title, message, type, created_at)
    VALUES (NEW.id, 'Hoş Geldin! 🎉', 'Sigara bırakma yolculuğunda başarılar! İlk adımı atmaya hazır mısın?', 'success', NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Yeni kullanıcı kaydı
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- SEED DATA (Örnek veriler - Test için)
-- ============================================================================

-- Başarım tipleri için lookup tablosu
CREATE TABLE IF NOT EXISTS achievement_types (
    type VARCHAR(50) PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    day_threshold INTEGER,
    tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond'))
);

INSERT INTO achievement_types (type, title, description, icon, day_threshold, tier) VALUES
('first_day', 'İlk Adım', 'Sigara bırakma yolculuğunun ilk günü!', '🌟', 1, 'bronze'),
('three_days', '3 Gün', 'İlk 3 günü tamamladın!', '⚡', 3, 'bronze'),
('one_week', '1 Hafta', 'İlk haftayı başarıyla tamamladın!', '🔥', 7, 'silver'),
('two_weeks', '2 Hafta', 'İki hafta sigarasız!', '💪', 14, 'silver'),
('one_month', '1 Ay', '30 gün sigarasız! Muhteşem!', '🏆', 30, 'gold'),
('two_months', '2 Ay', 'İki ayı geride bıraktın!', '⭐', 60, 'gold'),
('three_months', '3 Ay', 'Üçüncü ay tamamlandı!', '👑', 90, 'gold'),
('hundred_days', '100 Gün', '100 gün sigarasız!', '💯', 100, 'platinum'),
('six_months', '6 Ay', 'Yarım yıl sigarasız!', '💎', 180, 'platinum'),
('one_year', '1 Yıl', 'Tam 1 yıl sigarasız!', '🏅', 365, 'diamond'),
('sos_master', 'SOS Ustası', '10 kez SOS butonunu kullanarak isteği yendin!', '🆘', 0, 'silver'),
('journal_writer', 'Yazar', '10 günlük girişi yazdın!', '✍️', 0, 'silver'),
('social_butterfly', 'Sosyal Kelebek', 'Toplulukta 5 gönderi paylaştın!', '🦋', 0, 'bronze')
ON CONFLICT (type) DO NOTHING;

-- ============================================================================
-- SON TEMIZLIK
-- ============================================================================

-- Public schema izinlerini ayarla
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Tablo istatistiklerini güncelle
ANALYZE;

-- ============================================================================
-- KURULUM TAMAMLANDI!
-- ============================================================================
