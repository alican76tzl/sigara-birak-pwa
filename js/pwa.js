// PWA Service Worker Registration
class PWAManager {
    constructor() {
        this.swRegistration = null;
        this.isOnline = navigator.onLine;
        this.installPrompt = null;
        this.init();
    }

    async init() {
        // Register service worker
        await this.registerServiceWorker();
        
        // Handle online/offline status
        this.setupNetworkStatus();
        
        // Handle PWA install prompt
        this.setupInstallPrompt();
        
        // Handle app updates
        this.setupUpdateHandling();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', this.swRegistration.scope);

                // Check for updates
                this.swRegistration.addEventListener('updatefound', () => {
                    const newWorker = this.swRegistration.installing;
                    console.log('🔄 New Service Worker found');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        } else {
            console.warn('⚠️ Service Worker not supported');
        }
    }

    setupNetworkStatus() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNetworkStatus('İnternet bağlantısı geri geldi!', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNetworkStatus('İnternet bağlantısı kesildi!', 'error');
        });
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed successfully');
            this.hideInstallButton();
            if (window.showToast) {
                window.showToast('Uygulama başarıyla yüklendi!', 'success');
            }
        });
    }

    setupUpdateHandling() {
        // Listen for controlling service worker changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service Worker controller changed, reloading page');
            window.location.reload();
        });
    }

    showUpdateNotification() {
        if (window.showToast) {
            const updateToast = window.showToast(
                'Yeni güncelleme mevcut! Yüklemek için tıklayın.',
                'info',
                10000
            );

            // Add click handler to update
            if (updateToast) {
                updateToast.addEventListener('click', () => {
                    this.updateApp();
                });
            }
        }
    }

    async updateApp() {
        if (this.swRegistration && this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    showNetworkStatus(message, type) {
        if (window.showToast) {
            window.showToast(message, type, 3000);
        }
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        let installBtn = document.getElementById('pwa-install-btn');
        
        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.innerHTML = '📱 Uygulamayı Yükle';
            installBtn.className = 'pwa-install-btn';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                z-index: 1000;
                transition: all 0.3s ease;
                animation: slideInUp 0.5s ease-out;
            `;

            installBtn.addEventListener('mouseenter', () => {
                installBtn.style.transform = 'translateY(-2px)';
                installBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
            });

            installBtn.addEventListener('mouseleave', () => {
                installBtn.style.transform = 'translateY(0)';
                installBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            });

            installBtn.addEventListener('click', () => this.installApp());
            document.body.appendChild(installBtn);
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.animation = 'slideOutDown 0.5s ease-out';
            setTimeout(() => {
                installBtn.remove();
            }, 500);
        }
    }

    async installApp() {
        if (!this.installPrompt) return;

        try {
            const result = await this.installPrompt.prompt();
            console.log('Install prompt result:', result);
            
            this.installPrompt = null;
            this.hideInstallButton();
        } catch (error) {
            console.error('Install prompt error:', error);
        }
    }

    // Check if app is running in standalone mode
    isStandalone() {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://')
        );
    }

    // Get app info
    getAppInfo() {
        return {
            isOnline: this.isOnline,
            isStandalone: this.isStandalone(),
            swRegistered: !!this.swRegistration,
            canInstall: !!this.installPrompt,
            userAgent: navigator.userAgent,
            platform: navigator.platform
        };
    }
}

// Add CSS animations
const pwaStyles = `
<style>
@keyframes slideInUp {
    from {
        transform: translateY(100px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideOutDown {
    from {
        transform: translateY(0);
        opacity: 1;
    }
    to {
        transform: translateY(100px);
        opacity: 0;
    }
}

.pwa-install-btn:hover {
    transform: translateY(-2px) !important;
}
</style>
`;

// Inject styles
if (!document.querySelector('#pwa-styles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'pwa-styles';
    styleEl.innerHTML = pwaStyles;
    document.head.appendChild(styleEl);
}

// Initialize PWA Manager
window.pwaManager = new PWAManager();

// Development helper
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.pwaInfo = () => {
        console.table(window.pwaManager.getAppInfo());
    };
}
