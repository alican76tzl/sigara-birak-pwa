-- ============================================================================
-- MIGRATION: Eksik INSERT RLS Politikalarını Ekle
-- Çalıştırma tarihi: 2024
-- Amaç: Yeni kullanıcı kaydı sırasında trigger'ların profil/ayar/bildirim 
--       oluşturmasına izin vermek için eksik INSERT politikalarını ekleme
-- ============================================================================

-- 1. Profiles tablosu için INSERT politikası (yoksa oluştur)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Sistem yeni profil oluşturabilir'
    ) THEN
        CREATE POLICY "Sistem yeni profil oluşturabilir"
            ON profiles FOR INSERT
            WITH CHECK (auth.uid() = id);
        RAISE NOTICE '✅ Profiles INSERT policy created';
    ELSE
        RAISE NOTICE '⚠️ Profiles INSERT policy already exists';
    END IF;
END $$;

-- 2. User_settings tablosu için INSERT politikası (yoksa oluştur)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_settings' 
        AND policyname = 'Sistem yeni ayarlar oluşturabilir'
    ) THEN
        CREATE POLICY "Sistem yeni ayarlar oluşturabilir"
            ON user_settings FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ User_settings INSERT policy created';
    ELSE
        RAISE NOTICE '⚠️ User_settings INSERT policy already exists';
    END IF;
END $$;

-- 3. Notifications tablosu için INSERT politikası (yoksa oluştur)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Sistem yeni bildirim oluşturabilir'
    ) THEN
        CREATE POLICY "Sistem yeni bildirim oluşturabilir"
            ON notifications FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ Notifications INSERT policy created';
    ELSE
        RAISE NOTICE '⚠️ Notifications INSERT policy already exists';
    END IF;
END $$;

-- 4. Activities tablosu için INSERT politikası kontrolü (genellikle zaten vardır ama kontrol edelim)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activities' 
        AND policyname = 'Sistem yeni aktivite oluşturabilir'
    ) THEN
        CREATE POLICY "Sistem yeni aktivite oluşturabilir"
            ON activities FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE '✅ Activities INSERT policy created';
    ELSE
        RAISE NOTICE '⚠️ Activities INSERT policy already exists';
    END IF;
END $$;

-- ============================================================================
-- Politikaları doğrula
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_settings', 'notifications', 'activities')
ORDER BY tablename, policyname;

-- ============================================================================
-- MIGRATION TAMAMLANDI
-- ============================================================================
