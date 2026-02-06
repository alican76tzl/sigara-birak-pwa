// Data Storage - LocalStorage Veri Yönetimi
// Güvenli yapılandırma ile

class DataStorage {
    constructor() {
        // CONFIG objesinden storage keys al
        const config = window.CONFIG || {};
        this.keys = config.STORAGE_KEYS || {
            user: 'sb_user',
            progress: 'sb_progress',
            settings: 'sb_settings',
            achievements: 'sb_achievements',
            activities: 'sb_activities',
            quitDate: 'sb_quitDate',
            cigarettesPerDay: 'sb_cigarettesPerDay',
            pricePerPack: 'sb_pricePerPack'
        };
    }

    // Kullanıcı verilerini kaydet
    saveUser(userData) {
        localStorage.setItem(this.keys.user, JSON.stringify(userData));
    }

    // Kullanıcı verilerini getir
    getUser() {
        const data = localStorage.getItem(this.keys.user);
        return data ? JSON.parse(data) : null;
    }

    // Bırakma tarihini kaydet
    setQuitDate(date) {
        localStorage.setItem(this.keys.quitDate, new Date(date).toISOString());
        this.addActivity('quit_start', 'Sigara bırakma yolculuğu başladı!', 'success');
    }

    // Bırakma tarihini getir
    getQuitDate() {
        const date = localStorage.getItem(this.keys.quitDate);
        return date ? new Date(date) : null;
    }

    // Sigara bilgilerini kaydet
    setSmokingInfo(cigarettesPerDay, pricePerPack) {
        localStorage.setItem(this.keys.cigarettesPerDay, cigarettesPerDay);
        localStorage.setItem(this.keys.pricePerPack, pricePerPack);
    }

    // Sigara bilgilerini getir
    getSmokingInfo() {
        return {
            cigarettesPerDay: parseInt(localStorage.getItem(this.keys.cigarettesPerDay)) || 15,
            pricePerPack: parseFloat(localStorage.getItem(this.keys.pricePerPack)) || 42
        };
    }

    // İlerlemeyi hesapla
    calculateProgress() {
        const quitDate = this.getQuitDate();
        if (!quitDate) return null;

        const now = new Date();
        const diffTime = Math.abs(now - quitDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

        const smokingInfo = this.getSmokingInfo();
        const cigarettesNotSmoked = diffDays * smokingInfo.cigarettesPerDay;
        const moneySaved = (cigarettesNotSmoked / 20) * smokingInfo.pricePerPack;

        return {
            days: diffDays,
            hours: diffHours,
            minutes: diffMinutes,
            cigarettesNotSmoked,
            moneySaved: Math.floor(moneySaved),
            healthScore: Math.min(100, Math.floor(diffDays / 3.65)) // Max 100 at 1 year
        };
    }

    // Aktivite ekle
    addActivity(type, message, icon = 'info') {
        const activities = this.getActivities();
        const activity = {
            id: Date.now(),
            type,
            message,
            icon,
            timestamp: new Date().toISOString()
        };
        
        activities.unshift(activity); // Add to beginning
        
        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.pop();
        }
        
        localStorage.setItem(this.keys.activities, JSON.stringify(activities));
    }

    // Aktiviteleri getir
    getActivities() {
        const data = localStorage.getItem(this.keys.activities);
        return data ? JSON.parse(data) : [];
    }

    // Başarım kontrolü ve ekleme
    checkAndAddAchievements() {
        const progress = this.calculateProgress();
        if (!progress) return [];

        const milestones = [
            { days: 1, id: 'first_day', title: 'İlk Adım', icon: '🌟', desc: 'İlk günü tamamladın!' },
            { days: 3, id: 'three_days', title: '3 Gün Gücü', icon: '⚡', desc: 'Nikotin tamamen vücuttan atıldı!' },
            { days: 7, id: 'one_week', title: '1 Hafta', icon: '🔥', desc: 'İlk haftayı başarıyla tamamladın!' },
            { days: 14, id: 'two_weeks', title: '2 Hafta', icon: '💪', desc: 'Dolaşım sistemin iyileşiyor!' },
            { days: 30, id: 'one_month', title: '1 Ay', icon: '🏆', desc: '30 gün sigarasız!' },
            { days: 60, id: 'two_months', title: '2 Ay', icon: '🌟', desc: '2 ayın sonunda çok daha sağlıklısın!' },
            { days: 90, id: 'three_months', title: '3 Ay', icon: '👑', desc: 'Üçüncü ay tamamlandı!' },
            { days: 180, id: 'six_months', title: '6 Ay', icon: '💎', desc: 'Yarım yıl sigarasız!' },
            { days: 365, id: 'one_year', title: '1 Yıl', icon: '🏅', desc: 'Tam 1 yıl! Muhteşem bir başarı!' }
        ];

        const earned = [];
        const savedAchievements = this.getAchievements();

        milestones.forEach(milestone => {
            if (progress.days >= milestone.days && !savedAchievements.find(a => a.id === milestone.id)) {
                const achievement = {
                    ...milestone,
                    earnedAt: new Date().toISOString()
                };
                savedAchievements.push(achievement);
                earned.push(achievement);
                
                this.addActivity('achievement', `${milestone.title} başarımı kazanıldı!`, 'trophy');
            }
        });

        localStorage.setItem(this.keys.achievements, JSON.stringify(savedAchievements));
        return earned;
    }

    // Başarımları getir
    getAchievements() {
        const data = localStorage.getItem(this.keys.achievements);
        return data ? JSON.parse(data) : [];
    }

    // Ayarları kaydet
    saveSettings(settings) {
        localStorage.setItem(this.keys.settings, JSON.stringify(settings));
    }

    // Ayarları getir
    getSettings() {
        const defaults = {
            notifications: true,
            dailyReminder: true,
            milestoneNotifications: true,
            darkMode: false,
            compactMode: false,
            language: 'tr'
        };
        
        const saved = localStorage.getItem(this.keys.settings);
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    }

    // Tüm verileri dışa aktar
    exportData() {
        const data = {};
        Object.values(this.keys).forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                data[key] = value;
            }
        });
        return JSON.stringify(data, null, 2);
    }

    // Verileri içe aktar
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            Object.entries(data).forEach(([key, value]) => {
                localStorage.setItem(key, value);
            });
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }

    // Tüm verileri temizle
    clearAllData() {
        Object.values(this.keys).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}

// Global storage instance
const dataStorage = new DataStorage();
window.DataStorage = dataStorage;
