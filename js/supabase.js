// Supabase Configuration - Supabase Yapılandırması
const SUPABASE_URL = 'https://xvgqgtlknmirwhgzxpxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3FndGxrbm1pcndoZ3p4cHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzkyNzMsImV4cCI6MjA4NTkxNTI3M30.vGZLTLu-3m-hHXg0tstuC2kBSG54T_bEZQYjoIqDIK4';

// Supabase Client
let supabaseClient = null;

// Supabase'ı başlat
function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        console.log('✅ Supabase bağlantısı kuruldu');
        return supabaseClient;
    } else {
        console.error('❌ Supabase kütüphanesi yüklenmemiş');
        return null;
    }
}

// Kullanıcı oturumunu kontrol et
async function checkAuth() {
    if (!supabaseClient) initSupabase();
    
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (error || !user) {
        console.log('Kullanıcı girişi yapılmamış');
        return null;
    }
    
    return user;
}

// Auth state değişikliklerini dinle
function onAuthStateChange(callback) {
    if (!supabaseClient) initSupabase();
    
    supabaseClient.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// ============================================
// AUTH İŞLEMLERİ
// ============================================

async function signUp(email, password, fullName) {
    if (!supabaseClient) initSupabase();
    
    console.log('🚀 Kayıt başlatılıyor...', { email, fullName });
    
    // Kayıt dene
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin
        }
    });
    
    if (error) {
        console.error('❌ Kayıt hatası:', error);
        throw error;
    }
    
    console.log('✅ Kayıt başarılı, oturum açılıyor...');
    
    // Email confirm gerekse bile hemen giriş yapmayı dene
    try {
        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (signInError) {
            console.log('⚠️ Otomatik giriş başarısız (email confirm gerekli olabilir):', signInError.message);
            // Email confirm gerekli, kullanıcıya söyleyelim
            return { 
                user: data.user, 
                session: null, 
                message: 'Kayıt başarılı! Lütfen e-postanızı doğrulayın.' 
            };
        }
        
        if (signInData.user) {
            console.log('✅ Giriş başarılı, profil oluşturuluyor...');
            await createUserProfileFallback(signInData.user.id, email, fullName);
            return { 
                user: signInData.user, 
                session: signInData.session,
                message: 'Kayıt ve giriş başarılı!' 
            };
        }
    } catch (loginError) {
        console.warn('⚠️ Giriş hatası:', loginError.message);
    }
    
    return data;
}

// Manuel profil oluşturma (trigger çalışmazsa)
async function createUserProfileFallback(userId, email, fullName) {
    if (!supabaseClient) initSupabase();
    
    console.log('🔄 Fallback profil oluşturma başlıyor...', { userId, email, fullName });
    
    try {
        // Önce profil var mı kontrol et
        const { data: existingProfile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();
        
        if (existingProfile) {
            console.log('✅ Profil zaten var, fallback atlanıyor');
            return;
        }
        
        // Profil oluştur
        const { error: profileError } = await supabaseClient
            .from('profiles')
            .insert({
                id: userId,
                email: email,
                full_name: fullName,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        
        if (profileError) {
            console.error('❌ Profil oluşturma hatası:', profileError);
            throw profileError;
        }
        
        console.log('✅ Profil oluşturuldu');
        
    } catch (e) {
        console.error('❌ Fallback profil hatası:', e.message);
        // Hata fırlatma, sadece logla
    }
}

async function signIn(email, password) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    
    if (error) throw error;
    return data;
}

async function signOut() {
    if (!supabaseClient) initSupabase();
    
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
}

async function resetPassword(email) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html'
    });
    
    if (error) throw error;
    return data;
}

// ============================================
// PROFILE İŞLEMLERİ
// ============================================

async function getProfile(userId) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
}

async function updateProfile(userId, updates) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// ============================================
// SIGARA BIRAKMA BILGILERI
// ============================================

async function getQuitInfo(userId) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('quit_smoking_info')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
}

async function saveQuitInfo(userId, info) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('quit_smoking_info')
        .upsert({
            user_id: userId,
            ...info,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// ============================================
// CHECK-IN İŞLEMLERİ
// ============================================

async function getTodayCheckIn(userId) {
    if (!supabaseClient) initSupabase();
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabaseClient
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('checkin_date', today)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

async function saveCheckIn(userId, checkInData) {
    if (!supabaseClient) initSupabase();
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabaseClient
        .from('daily_checkins')
        .upsert({
            user_id: userId,
            checkin_date: today,
            ...checkInData,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

async function getCheckInHistory(userId, days = 7) {
    if (!supabaseClient) initSupabase();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabaseClient
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('checkin_date', startDate.toISOString().split('T')[0])
        .order('checkin_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
}

// ============================================
// MOOD İŞLEMLERİ
// ============================================

async function getTodayMood(userId) {
    if (!supabaseClient) initSupabase();
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabaseClient
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', today)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

async function saveMoodEntry(userId, moodData) {
    if (!supabaseClient) initSupabase();
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabaseClient
        .from('mood_entries')
        .upsert({
            user_id: userId,
            entry_date: today,
            ...moodData
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

async function getMoodHistory(userId, days = 7) {
    if (!supabaseClient) initSupabase();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabaseClient
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', startDate.toISOString().split('T')[0])
        .order('entry_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
}

// ============================================
// JOURNAL İŞLEMLERİ
// ============================================

async function getJournalEntries(userId, limit = 10) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false })
        .limit(limit);
    
    if (error) throw error;
    return data || [];
}

async function saveJournalEntry(userId, entry) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('journal_entries')
        .upsert({
            user_id: userId,
            ...entry,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

async function deleteJournalEntry(userId, entryId) {
    if (!supabaseClient) initSupabase();
    
    const { error } = await supabaseClient
        .from('journal_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);
    
    if (error) throw error;
}

// ============================================
// BASARIM İŞLEMLERİ
// ============================================

async function getAchievements(userId) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
}

async function checkNewAchievements(userId) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .rpc('check_and_add_achievements', { user_uuid: userId });
    
    if (error) throw error;
    return data || [];
}

// ============================================
// AKTIVITE İŞLEMLERİ
// ============================================

async function getActivities(userId, limit = 20) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    
    if (error) throw error;
    return data || [];
}

async function addActivity(userId, activityType, message, icon = '✓') {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('activities')
        .insert({
            user_id: userId,
            activity_type: activityType,
            message: message,
            icon: icon
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// ============================================
// TOPLULUK İŞLEMLERİ
// ============================================

async function getCommunityPosts(limit = 20, offset = 0) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('community_posts')
        .select(`
            *,
            profiles:user_id (full_name, avatar_url)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
}

async function createPost(userId, content, postType = 'general', isAnonymous = false) {
    if (!supabaseClient) initSupabase();
    
    // Kullanıcının sigarasız gün sayısını al
    const { data: quitInfo } = await supabaseClient
        .from('quit_smoking_info')
        .select('quit_date')
        .eq('user_id', userId)
        .single();
    
    let daysSmokeFree = 0;
    if (quitInfo) {
        daysSmokeFree = Math.floor((new Date() - new Date(quitInfo.quit_date)) / (1000 * 60 * 60 * 24));
    }
    
    const { data, error } = await supabaseClient
        .from('community_posts')
        .insert({
            user_id: userId,
            content: content,
            post_type: postType,
            days_smoke_free: daysSmokeFree,
            is_anonymous: isAnonymous
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

async function likePost(userId, postId) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('post_likes')
        .upsert({
            post_id: postId,
            user_id: userId
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

async function unlikePost(userId, postId) {
    if (!supabaseClient) initSupabase();
    
    const { error } = await supabaseClient
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    
    if (error) throw error;
}

async function addComment(userId, postId, content) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('post_comments')
        .insert({
            post_id: postId,
            user_id: userId,
            content: content
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// ============================================
// LIDERLIK TABLOSU
// ============================================

async function getLeaderboard(limit = 50) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('community_leaderboard')
        .select('*')
        .limit(limit);
    
    if (error) throw error;
    return data || [];
}

// ============================================
// AYARLAR
// ============================================

async function getUserSettings(userId) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

async function updateUserSettings(userId, settings) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('user_settings')
        .upsert({
            user_id: userId,
            ...settings,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// ============================================
// BILDIRIMLER
// ============================================

async function getNotifications(userId, onlyUnread = false) {
    if (!supabaseClient) initSupabase();
    
    let query = supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (onlyUnread) {
        query = query.eq('is_read', false);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
}

async function markNotificationAsRead(userId, notificationId) {
    if (!supabaseClient) initSupabase();
    
    const { error } = await supabaseClient
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);
    
    if (error) throw error;
}

// ============================================
// ISTATISTIKLER
// ============================================

async function getUserProgressSummary(userId) {
    if (!supabaseClient) initSupabase();
    
    const { data, error } = await supabaseClient
        .from('user_progress_summary')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    if (error) throw error;
    return data;
}

// ============================================
// GLOBAL EXPORT
// ============================================

window.SupabaseConfig = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    client: supabaseClient,
    init: initSupabase,
    checkAuth,
    onAuthStateChange,
    auth: {
        signUp,
        signIn,
        signOut,
        resetPassword
    },
    profile: {
        get: getProfile,
        update: updateProfile
    },
    quitInfo: {
        get: getQuitInfo,
        save: saveQuitInfo
    },
    checkIns: {
        getToday: getTodayCheckIn,
        save: saveCheckIn,
        getHistory: getCheckInHistory
    },
    mood: {
        getToday: getTodayMood,
        save: saveMoodEntry,
        getHistory: getMoodHistory
    },
    journal: {
        getEntries: getJournalEntries,
        save: saveJournalEntry,
        delete: deleteJournalEntry
    },
    achievements: {
        get: getAchievements,
        checkNew: checkNewAchievements
    },
    activities: {
        get: getActivities,
        add: addActivity
    },
    community: {
        getPosts: getCommunityPosts,
        createPost,
        likePost,
        unlikePost,
        addComment
    },
    leaderboard: {
        get: getLeaderboard
    },
    settings: {
        get: getUserSettings,
        update: updateUserSettings
    },
    notifications: {
        get: getNotifications,
        markAsRead: markNotificationAsRead
    },
    progress: {
        getSummary: getUserProgressSummary
    }
};
