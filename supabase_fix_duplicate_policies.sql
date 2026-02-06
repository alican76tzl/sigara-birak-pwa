-- ============================================================================
-- SIGARA BIRAK - SUPABASE RLS POLICY FIX
-- Duplicate policy'leri kaldırma ve düzeltme
-- ============================================================================

-- NOT: Bu dosyayı çalıştırmadan önce mevcut duplicate policy'leri kontrol edin

-- ============================================================================
-- 1. ACTIVITIES TABLOSU - Duplicate Policy Düzeltmesi
-- ============================================================================

-- Eski duplicate policy'yi kaldır
DROP POLICY IF EXISTS "Sistem yeni aktivite oluşturabilir" ON activities;

-- Sadece tek bir INSERT policy yeterli
-- "Kullanıcılar kendi aktivitelerini ekleyebilir" policy'si zaten var ve yeterli

-- ============================================================================
-- 2. USER_SETTINGS TABLOSU - Duplicate Policy Düzeltmesi
-- ============================================================================

-- Eski duplicate policy'yi kaldır
DROP POLICY IF EXISTS "Sistem yeni ayarlar oluşturabilir" ON user_settings;

-- "Kullanıcılar kendi ayarlarını güncelleyebilir" FOR ALL zaten INSERT'i kapsıyor

-- ============================================================================
-- 3. NOTIFICATIONS TABLOSU - Duplicate Policy Düzeltmesi
-- ============================================================================

-- Eski duplicate policy'yi kaldır
DROP POLICY IF EXISTS "Sistem yeni bildirim oluşturabilir" ON notifications;

-- Trigger'lar için özel bir policy gerekirse, service role kullanılmalı
-- Anon key ile INSERT yapılmamalı

-- ============================================================================
-- 4. PROFILES TABLOSU - Policy İyileştirmesi
-- ============================================================================

-- Mevcut policy'ler yeterli, ek düzenleme gerekmiyor
-- "Sistem yeni profil oluşturabilir" trigger için gerekli

-- ============================================================================
-- DOĞRULAMA
-- ============================================================================

-- Tüm policy'leri listele ve kontrol et
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- TAMAMLANDI
-- ============================================================================
