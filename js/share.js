// Share System - İlerleme Paylaşma Özelliği
class ShareSystem {
    constructor() {
        this.templates = {
            milestone: [
                "🎉 Bugün sigarayı bırakmamın {days}. günü! Her gün daha sağlıklıyım. #SigaraBırak",
                "💪 {days} gündür sigarasız! Kendimle gurur duyuyorum. #SağlıklıYaşam",
                "✨ {days} gündür sigaraya hayır diyorum. Sen de yapabilirsin! 🚭",
                "🏆 {days}. gün tamamlandı! Tasarruf: ₺{savings}. Hem sağlık hem para 💰",
                "🌟 Bugün {days}. günüm! Sigara bırakmak zor ama imkansız değil. #Başarı"
            ],
            savings: [
                "💰 Sigarasız {days} günde ₺{savings} biriktirdim! Bu parayla {item} alabilirim 🎁",
                "🚭 {days} gündür sigara içmiyorum ve ₺{savings} cepte kaldı! #AkıllıSeçim",
                "📊 {days} gün = ₺{savings} tasarruf + daha sağlıklı bir hayat! 🌟",
                "💪 Sigara bırakmak sadece sağlık değil, finansal özgürlük de demek! ₺{savings} ✨"
            ],
            health: [
                "🫁 {days} gündür sigarasız! Akciğerlerim her geçen gün iyileşiyor.",
                "❤️ Kalbim için en iyi kararı verdim. {days} gün sigarasız! 💪",
                "🌬️ Temiz hava, temiz ciğerler! {days} gündür sigaraya hayır!",
                "⚡ Enerjim arttı, nefesim açıldı. {days} gün sigarasız hayat! 🌟"
            ]
        };
    }

    // İlerleme verilerini hazırla
    prepareShareData() {
        const storage = window.DataStorage;
        if (!storage) return null;

        const progress = storage.calculateProgress();
        if (!progress) return null;

        return {
            days: progress.days,
            savings: progress.moneySaved.toLocaleString(),
            cigarettes: progress.cigarettesNotSmoked.toLocaleString(),
            healthScore: progress.healthScore
        };
    }

    // Rastgele mesaj seç ve doldur
    generateMessage(type = 'milestone') {
        const data = this.prepareShareData();
        if (!data) return null;

        const templates = this.templates[type];
        const template = templates[Math.floor(Math.random() * templates.length)];

        return template
            .replace('{days}', data.days)
            .replace('{savings}', data.savings)
            .replace('{cigarettes}', data.cigarettes)
            .replace('{item}', this.getAffordableItem(data.savings));
    }

    // Alınabilecek ürün önerisi
    getAffordableItem(savingsAmount) {
        const amount = parseInt(savingsAmount.replace(/[^0-9]/g, ''));
        
        const items = [
            { min: 50, item: "güzel bir kahve" },
            { min: 200, item: "bir kitap" },
            { min: 500, item: "sinema bileti" },
            { min: 1000, item: "yeni ayakkabı" },
            { min: 2000, item: "akıllı saat" },
            { min: 5000, item: "küçük tatil" },
            { min: 10000, item: "yeni telefon" },
            { min: 15000, item: "Avrupa turu" }
        ];

        const affordable = items.filter(i => amount >= i.min);
        if (affordable.length === 0) return "bir şeyler";
        
        return affordable[affordable.length - 1].item;
    }

    // Paylaşım diyaloğu göster
    showShareDialog() {
        const data = this.prepareShareData();
        if (!data) {
            this.showToast('Önce sigara bırakma tarihinizi ayarlayın!', 'error');
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'share-dialog';
        dialog.innerHTML = `
            <div class="share-overlay"></div>
            <div class="share-content">
                <div class="share-header">
                    <h3>🎉 Başarını Paylaş</h3>
                    <button class="share-close">×</button>
                </div>
                
                <div class="share-preview">
                    <div class="share-card">
                        <div class="share-stats">
                            <div class="share-stat">
                                <div class="share-number">${data.days}</div>
                                <div class="share-label">Gün</div>
                            </div>
                            <div class="share-stat">
                                <div class="share-number">₺${data.savings}</div>
                                <div class="share-label">Tasarruf</div>
                            </div>
                        </div>
                        <div class="share-message" id="shareMessage">${this.generateMessage('milestone')}</div>
                    </div>
                </div>

                <div class="share-options">
                    <button class="share-btn" data-type="milestone">
                        <span>🏆</span> Kilometre Taşı
                    </button>
                    <button class="share-btn" data-type="savings">
                        <span>💰</span> Tasarruf
                    </button>
                    <button class="share-btn" data-type="health">
                        <span>❤️</span> Sağlık
                    </button>
                    <button class="share-btn refresh" id="refreshMessage">
                        <span>↻</span> Yeni Mesaj
                    </button>
                </div>

                <div class="share-platforms">
                    <button class="platform-btn twitter" data-platform="twitter">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                        Twitter
                    </button>
                    <button class="platform-btn facebook" data-platform="facebook">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                        Facebook
                    </button>
                    <button class="platform-btn whatsapp" data-platform="whatsapp">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        WhatsApp
                    </button>
                    <button class="platform-btn copy" id="copyMessage">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Kopyala
                    </button>
                </div>
            </div>
        `;

        this.addDialogStyles();
        document.body.appendChild(dialog);

        // Event handlers
        const closeBtn = dialog.querySelector('.share-close');
        const overlay = dialog.querySelector('.share-overlay');
        const close = () => dialog.remove();
        
        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);

        // Type buttons
        dialog.querySelectorAll('.share-btn[data-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const message = this.generateMessage(type);
                dialog.querySelector('#shareMessage').textContent = message;
            });
        });

        // Refresh button
        dialog.querySelector('#refreshMessage').addEventListener('click', () => {
            const currentType = dialog.querySelector('.share-btn.active')?.dataset.type || 'milestone';
            const message = this.generateMessage(currentType);
            dialog.querySelector('#shareMessage').textContent = message;
        });

        // Platform buttons
        dialog.querySelectorAll('.platform-btn[data-platform]').forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                const message = dialog.querySelector('#shareMessage').textContent;
                this.shareToPlatform(platform, message);
            });
        });

        // Copy button
        dialog.querySelector('#copyMessage').addEventListener('click', () => {
            const message = dialog.querySelector('#shareMessage').textContent;
            navigator.clipboard.writeText(message).then(() => {
                this.showToast('Mesaj kopyalandı!', 'success');
            });
        });

        // Set active state
        dialog.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                dialog.querySelectorAll('.share-btn').forEach(b => b.classList.remove('active'));
                if (this.dataset.type) this.classList.add('active');
            });
        });
    }

    // Sosyal medyaya paylaş
    shareToPlatform(platform, message) {
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(message)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`
        };

        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    }

    // Toast göster
    showToast(message, type = 'info') {
        if (window.NotificationSystem) {
            window.NotificationSystem.showToast(message, type);
        }
    }

    // Dialog stilleri
    addDialogStyles() {
        if (document.getElementById('share-dialog-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'share-dialog-styles';
        styles.textContent = `
            .share-dialog { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; }
            .share-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
            .share-content { position: relative; background: white; border-radius: 20px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; padding: 1.5rem; animation: shareSlideUp 0.3s ease; }
            @keyframes shareSlideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .share-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
            .share-header h3 { font-size: 1.25rem; color: #1e293b; }
            .share-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.25rem; color: #64748b; }
            .share-close:hover { background: #e2e8f0; }
            .share-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem; }
            .share-stats { display: flex; gap: 2rem; margin-bottom: 1rem; }
            .share-stat { text-align: center; }
            .share-number { font-size: 2rem; font-weight: 700; }
            .share-label { font-size: 0.875rem; opacity: 0.9; }
            .share-message { font-size: 1rem; line-height: 1.5; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2); }
            .share-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
            .share-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; background: white; border-radius: 10px; cursor: pointer; font-size: 0.9rem; color: #64748b; transition: all 0.2s; }
            .share-btn:hover, .share-btn.active { border-color: #667eea; color: #667eea; background: rgba(102, 126, 234, 0.05); }
            .share-btn span { font-size: 1.25rem; }
            .share-platforms { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
            .platform-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.875rem; border: none; border-radius: 10px; cursor: pointer; font-size: 0.9rem; font-weight: 500; color: white; transition: transform 0.2s; }
            .platform-btn:hover { transform: translateY(-2px); }
            .platform-btn svg { width: 20px; height: 20px; }
            .platform-btn.twitter { background: #1da1f2; }
            .platform-btn.facebook { background: #4267B2; }
            .platform-btn.whatsapp { background: #25d366; }
            .platform-btn.copy { background: #64748b; }
            @media (max-width: 480px) { .share-options, .share-platforms { grid-template-columns: 1fr; } }
        `;
        document.head.appendChild(styles);
    }

    // Paylaşım butonu oluştur
    createShareButton() {
        const btn = document.createElement('button');
        btn.className = 'share-progress-btn';
        btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Başarını Paylaş
        `;
        btn.addEventListener('click', () => this.showShareDialog());
        return btn;
    }
}

// Global instance
const shareSystem = new ShareSystem();
window.ShareSystem = shareSystem;
