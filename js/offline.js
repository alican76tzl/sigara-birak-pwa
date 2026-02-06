// Offline Support - Çevrimdışı Destek
class OfflineSupport {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineQueue = [];
        this.init();
    }

    init() {
        // Online/offline event listeners
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Load queued actions
        this.loadQueue();

        // Show initial status
        if (!this.isOnline) {
            this.showOfflineStatus();
        }
    }

    handleOnline() {
        this.isOnline = true;
        this.showToast('İnternet bağlantısı geri geldi! 🌐', 'success');
        this.syncQueue();
        this.hideOfflineBanner();
    }

    handleOffline() {
        this.isOnline = false;
        this.showToast('Çevrimdışı moddasınız. Veriler kaydedilecek ve bağlantı gelince senkronize edilecek.', 'warning');
        this.showOfflineBanner();
    }

    showOfflineBanner() {
        if (document.getElementById('offline-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'offline-banner';
        banner.innerHTML = `
            <span class="offline-icon">📡</span>
            <span class="offline-text">Çevrimdışı Mod</span>
            <span class="offline-subtext">Veriler cihazınızda saklanıyor</span>
        `;

        const styles = document.createElement('style');
        styles.textContent = `
            #offline-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #f59e0b;
                color: white;
                padding: 0.75rem;
                text-align: center;
                font-size: 0.9rem;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
            }
            .offline-icon { font-size: 1.25rem; }
            .offline-text { font-weight: 600; }
            .offline-subtext { opacity: 0.9; font-size: 0.8rem; }
            body { padding-top: 50px; }
        `;
        document.head.appendChild(styles);
        document.body.appendChild(banner);
    }

    hideOfflineBanner() {
        const banner = document.getElementById('offline-banner');
        if (banner) {
            banner.remove();
            document.body.style.paddingTop = '';
        }
    }

    // İşlemi kuyruğa ekle
    queueAction(action) {
        this.offlineQueue.push({
            ...action,
            timestamp: new Date().toISOString()
        });
        this.saveQueue();
    }

    // Kuyruğu kaydet
    saveQueue() {
        localStorage.setItem('offlineQueue', JSON.stringify(this.offlineQueue));
    }

    // Kuyruğu yükle
    loadQueue() {
        const saved = localStorage.getItem('offlineQueue');
        if (saved) {
            this.offlineQueue = JSON.parse(saved);
        }
    }

    // Kuyruğu senkronize et
    async syncQueue() {
        if (this.offlineQueue.length === 0) return;

        let synced = 0;
        for (const action of [...this.offlineQueue]) {
            try {
                // Simulate API call
                await this.processAction(action);
                synced++;
            } catch (error) {
                console.error('Sync failed for action:', action, error);
            }
        }

        if (synced > 0) {
            this.showToast(`${synced} işlem başarıyla senkronize edildi!`, 'success');
        }
    }

    // İşlemi işle (simulation)
    async processAction(action) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Remove from queue
                this.offlineQueue = this.offlineQueue.filter(a => a.timestamp !== action.timestamp);
                this.saveQueue();
                resolve(true);
            }, 500);
        });
    }

    // Cache temizle
    clearCache() {
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
    }

    showToast(message, type = 'info') {
        if (window.NotificationSystem) {
            window.NotificationSystem.showToast(message, type);
        }
    }
}

// Global instance
const offlineSupport = new OfflineSupport();
window.OfflineSupport = offlineSupport;
