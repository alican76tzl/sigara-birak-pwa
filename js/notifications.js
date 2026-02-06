// Notification System - Bildirim Sistemi
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.permission = false;
        this.init();
    }

    init() {
        // Check browser notification support
        if ('Notification' in window) {
            this.permission = Notification.permission === 'granted';
            if (Notification.permission !== 'denied' && !this.permission) {
                // Request permission silently
                setTimeout(() => this.requestPermission(), 5000);
            }
        }
        
        // Load saved notifications
        this.loadNotifications();
        
        // Start checking for scheduled notifications
        setInterval(() => this.checkScheduledNotifications(), 60000); // Every minute
    }

    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.permission = permission === 'granted';
            return this.permission;
        }
        return false;
    }

    // Browser bildirimi gönder
    showBrowserNotification(title, options = {}) {
        if (!this.permission) return;

        const defaultOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'sigara-birak-notification',
            requireInteraction: false,
            ...options
        };

        const notification = new Notification(title, defaultOptions);
        
        notification.onclick = () => {
            window.focus();
            notification.close();
            if (options.onClick) options.onClick();
        };

        return notification;
    }

    // In-app toast bildirimi
    showToast(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `app-toast toast-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">×</button>
        `;

        // Add styles if not exists
        this.ensureToastStyles();

        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove
        const timeout = setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeout);
            this.removeToast(toast);
        });
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }

    ensureToastStyles() {
        if (document.getElementById('toast-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .app-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                padding: 1rem 1.5rem;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                min-width: 300px;
                max-width: 400px;
                z-index: 10000;
                transform: translateX(120%);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .app-toast.show {
                transform: translateX(0);
                opacity: 1;
            }
            .toast-icon {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
                font-weight: 700;
                flex-shrink: 0;
            }
            .toast-success .toast-icon { background: #22c55e; color: white; }
            .toast-error .toast-icon { background: #ef4444; color: white; }
            .toast-info .toast-icon { background: #3b82f6; color: white; }
            .toast-warning .toast-icon { background: #f59e0b; color: white; }
            .toast-message { flex: 1; font-size: 0.95rem; color: #1e293b; }
            .toast-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #94a3b8;
                cursor: pointer;
                line-height: 1;
            }
            .toast-close:hover { color: #64748b; }
            @media (max-width: 480px) {
                .app-toast {
                    left: 10px;
                    right: 10px;
                    min-width: auto;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Bildirim planla
    scheduleNotification(id, title, message, scheduledTime, type = 'info') {
        const notification = {
            id,
            title,
            message,
            scheduledTime: new Date(scheduledTime).getTime(),
            type,
            shown: false
        };

        this.notifications.push(notification);
        this.saveNotifications();
        return notification;
    }

    // Planlanmış bildirimleri kontrol et
    checkScheduledNotifications() {
        const now = Date.now();
        
        this.notifications.forEach(notif => {
            if (!notif.shown && notif.scheduledTime <= now) {
                this.showBrowserNotification(notif.title, {
                    body: notif.message,
                    onClick: () => {
                        window.location.href = '/dashboard.html';
                    }
                });
                this.showToast(notif.message, notif.type);
                notif.shown = true;
            }
        });

        this.saveNotifications();
    }

    // Günlük hatırlatıcı bildirimler
    setupDailyReminders() {
        const now = new Date();
        const tomorrow8am = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0, 0);
        
        // Sabah motivasyon bildirimi
        this.scheduleNotification(
            'morning-motivation',
            '🌅 Günaydın!',
            'Bugün de sigarasız bir gün seni bekliyor. Sen yapabilirsin! 💪',
            tomorrow8am,
            'info'
        );

        // Haftalık kilometre taşı kontrolü
        const messages = [
            { days: 7, title: '🎉 1 Hafta!', message: 'Tebrikler! İlk haftayı tamamladın. Bu çok büyük bir başarı!' },
            { days: 30, title: '🏆 1 Ay!', message: '30 gün sigarasız! Akciğerlerin şimdiden iyileşmeye başladı.' },
            { days: 100, title: '💯 100 Gün!', message: '100 gün! Artık bir ustasın. Gurur duyabilirsin!' },
            { days: 365, title: '🌟 1 Yıl!', message: '1 yıl sigarasız! Kalp hastalığı riskin yarı yarıya azaldı!' }
        ];

        return messages;
    }

    // Anlık bildirim gönder
    sendInstantNotification(title, message, type = 'info') {
        this.showBrowserNotification(title, { body: message });
        this.showToast(message, type);
    }

    // Bildirimleri kaydet
    saveNotifications() {
        localStorage.setItem('scheduledNotifications', JSON.stringify(this.notifications));
    }

    // Bildirimleri yükle
    loadNotifications() {
        const saved = localStorage.getItem('scheduledNotifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
        }
    }

    // Tüm bildirimleri temizle
    clearAll() {
        this.notifications = [];
        this.saveNotifications();
    }
}

// Global notification instance
const notificationSystem = new NotificationSystem();

// Export for use in other modules
window.NotificationSystem = notificationSystem;
