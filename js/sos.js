// SOS Emergency System - Acil Durum Yardım Sistemi
class SOSHelpSystem {
    constructor() {
        this.techniques = [
            {
                icon: '🫁',
                title: '4-7-8 Nefes Tekniği',
                desc: '4 saniye nefes al, 7 saniz tut, 8 saniye ver. 3 tekrar yap.',
                color: '#667eea'
            },
            {
                icon: '🚰',
                title: 'Soğuk Su İç',
                desc: 'Bir bardak soğuk su iç. Susuzluk sigara isteğini tetikler.',
                color: '#4facfe'
            },
            {
                icon: '🚶',
                title: '5 Dakika Yürüyüş',
                desc: 'Hemen dışarı çık veya evde gezin. Hareket isteği azaltır.',
                color: '#22c55e'
            },
            {
                icon: '🍎',
                title: 'Sağlıklı Atıştırma',
                desc: 'Elma, havuç veya sakız çiğne. Ağzın meşgul olsun.',
                color: '#f59e0b'
            },
            {
                icon: '🎵',
                title: 'Müzik Dinle',
                desc: 'Sevdiğin bir şarkıyı aç ve derin nefes alarak dinle.',
                color: '#f093fb'
            },
            {
                icon: '📞',
                title: 'Birini Ara',
                desc: 'Destek alabileceğin bir arkadaşını veya aile üni arayın.',
                color: '#ef4444'
            },
            {
                icon: '🧘',
                title: 'Meditasyon',
                desc: 'Gözlerini kapat, 10 derin nefes al. Zihnini boşalt.',
                color: '#764ba2'
            },
            {
                icon: '✍️',
                title: 'Nedenlerini Yaz',
                desc: 'Neden bıraktığını yaz. Sağlık, para, aile...',
                color: '#10b981'
            }
        ];
        
        this.quotes = [
            "Bu istek 3-5 dakika içinde geçecek. Dayanabilirsin! 💪",
            "Şimdi sigara içsen pişman olursun, içmesen gurur duyarsın! 🌟",
            "Daha önce binlerce istekle başa çıktın, şimdi de yapabilirsin! 🔥",
            "Her 'hayır' demen, bağımlılığa karşı kazanılan bir zafer! 🏆",
            "Bir sigara, zincirin bir halkasıdır. Kır onu! ⛓️",
            "5 dakika sonra bu istek olmayacak. Sadece bekle... ⏱️",
            "Kendine hatırlat: Neden bıraktığını düşün! 💭"
        ];
    }

    // SOS Butonu oluştur
    createSOSButton() {
        const btn = document.createElement('button');
        btn.className = 'sos-button';
        btn.innerHTML = `
            <span class="sos-icon">🆘</span>
            <span class="sos-text">Acil Yardım</span>
            <span class="sos-pulse"></span>
        `;
        
        btn.addEventListener('click', () => this.showSOSDialog());
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .sos-button {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                z-index: 9999;
                transition: transform 0.3s;
            }
            .sos-button:hover { transform: scale(1.05); }
            .sos-icon { font-size: 1.5rem; }
            .sos-pulse {
                position: absolute;
                inset: -5px;
                border: 2px solid #ef4444;
                border-radius: 50px;
                animation: sosPulse 2s infinite;
            }
            @keyframes sosPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0; }
            }
            @media (max-width: 768px) {
                .sos-button { padding: 0.875rem; }
                .sos-text { display: none; }
            }
        `;
        document.head.appendChild(styles);
        
        return btn;
    }

    // SOS Diyaloğu göster
    showSOSDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'sos-dialog';
        
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        
        dialog.innerHTML = `
            <div class="sos-overlay"></div>
            <div class="sos-content">
                <div class="sos-header">
                    <div class="sos-icon-big">🆘</div>
                    <h2>Sakin Ol, Dayanabilirsin!</h2>
                    <p>${randomQuote}</p>
                    <button class="sos-close">×</button>
                </div>
                
                <div class="sos-timer">
                    <div class="timer-circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                            <circle id="sosTimerCircle" cx="50" cy="50" r="45" fill="none" stroke="#667eea" stroke-width="8" 
                                    stroke-dasharray="283" stroke-dashoffset="0" stroke-linecap="round"
                                    style="transform: rotate(-90deg); transform-origin: center; transition: stroke-dashoffset 1s linear;"/>
                        </svg>
                        <div class="timer-text" id="sosTimerText">05:00</div>
                    </div>
                    <p class="timer-label">Bu istek 5 dakika içinde geçecek</p>
                </div>

                <div class="sos-techniques">
                    <h3>Hemen Şunu Dene:</h3>
                    <div class="techniques-grid">
                        ${this.techniques.map(t => `
                            <div class="technique-card" style="--accent: ${t.color}">
                                <div class="tech-icon">${t.icon}</div>
                                <div class="tech-title">${t.title}</div>
                                <div class="tech-desc">${t.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="sos-actions">
                    <button class="sos-success-btn" id="overcameBtn">
                        ✅ İsteği Yendim!
                    </button>
                    <button class="sos-chat-btn" id="needHelpBtn">
                        💬 Daha Fazla Yardım
                    </button>
                </div>
            </div>
        `;

        this.addDialogStyles();
        document.body.appendChild(dialog);

        // Timer
        this.startTimer(dialog.querySelector('#sosTimerCircle'), dialog.querySelector('#sosTimerText'));

        // Event handlers
        const closeBtn = dialog.querySelector('.sos-close');
        const overlay = dialog.querySelector('.sos-overlay');
        const overcameBtn = dialog.querySelector('#overcameBtn');
        const needHelpBtn = dialog.querySelector('#needHelpBtn');

        const close = () => dialog.remove();

        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);

        overcameBtn.addEventListener('click', () => {
            this.celebrate(dialog);
            setTimeout(() => {
                dialog.remove();
                this.showToast('🎉 Harika! Bir isteği daha yendin!', 'success');
                
                // Save activity
                if (window.DataStorage) {
                    window.DataStorage.addActivity('craving_defeated', 'Sigara isteğini yendi!', 'trophy');
                }
            }, 1500);
        });

        needHelpBtn.addEventListener('click', () => {
            this.showMoreHelp();
        });
    }

    // Geri sayım timer'ı
    startTimer(circle, text) {
        let seconds = 300; // 5 minutes
        const total = 283; // circumference
        
        const interval = setInterval(() => {
            if (!document.contains(circle)) {
                clearInterval(interval);
                return;
            }

            seconds--;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            text.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            
            const offset = total - (seconds / 300) * total;
            circle.style.strokeDashoffset = offset;

            if (seconds <= 0) {
                clearInterval(interval);
                text.textContent = 'SÜRE DOLDU!';
                circle.style.stroke = '#22c55e';
            }
        }, 1000);
    }

    // Kutlama efekti
    celebrate(container) {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: hsl(${Math.random() * 360}, 100%, 50%);
                border-radius: 50%;
                left: 50%;
                top: 50%;
                pointer-events: none;
                animation: confettiFall 1s ease forwards;
            `;
            
            const angle = (Math.PI * 2 * i) / 50;
            const velocity = 100 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            confetti.style.setProperty('--tx', `${tx}px`);
            confetti.style.setProperty('--ty', `${ty}px`);
            
            container.appendChild(confetti);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes confettiFall {
                0% { transform: translate(0, 0) scale(1); opacity: 1; }
                100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
            }
        `;
        container.appendChild(style);
    }

    // Daha fazla yardım göster
    showMoreHelp() {
        if (window.NotificationSystem) {
            window.NotificationSystem.showToast(
                'Topluluk sayfasından destek alabilir veya uzman yardımı isteyebilirsiniz!',
                'info',
                5000
            );
        }
    }

    showToast(message, type) {
        if (window.NotificationSystem) {
            window.NotificationSystem.showToast(message, type);
        }
    }

    // Dialog stilleri
    addDialogStyles() {
        if (document.getElementById('sos-dialog-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'sos-dialog-styles';
        styles.textContent = `
            .sos-dialog { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; }
            .sos-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }
            .sos-content { position: relative; background: white; border-radius: 24px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: 2rem; animation: sosSlideUp 0.4s ease; }
            @keyframes sosSlideUp { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .sos-header { text-align: center; margin-bottom: 1.5rem; position: relative; }
            .sos-icon-big { font-size: 4rem; margin-bottom: 0.5rem; animation: pulse 1s infinite; }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
            .sos-header h2 { color: #ef4444; font-size: 1.5rem; margin-bottom: 0.5rem; }
            .sos-header p { color: #64748b; font-size: 1.1rem; font-style: italic; }
            .sos-close { position: absolute; top: -1rem; right: -1rem; background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; }
            .sos-close:hover { background: #e2e8f0; }
            .sos-timer { text-align: center; margin: 1.5rem 0; }
            .timer-circle { width: 150px; height: 150px; margin: 0 auto; position: relative; }
            .timer-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.75rem; font-weight: 700; color: #1e293b; }
            .timer-label { margin-top: 1rem; color: #64748b; font-size: 0.9rem; }
            .sos-techniques h3 { margin-bottom: 1rem; color: #1e293b; }
            .techniques-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
            .technique-card { background: #f8fafc; border-radius: 12px; padding: 1rem; border-left: 4px solid var(--accent); cursor: pointer; transition: all 0.2s; }
            .technique-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .tech-icon { font-size: 2rem; margin-bottom: 0.5rem; }
            .tech-title { font-weight: 600; color: #1e293b; font-size: 0.9rem; margin-bottom: 0.25rem; }
            .tech-desc { font-size: 0.8rem; color: #64748b; line-height: 1.4; }
            .sos-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
            .sos-success-btn { flex: 1; padding: 1rem; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; border: none; border-radius: 12px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: transform 0.2s; }
            .sos-success-btn:hover { transform: scale(1.02); }
            .sos-chat-btn { flex: 1; padding: 1rem; background: #f1f5f9; color: #64748b; border: none; border-radius: 12px; font-weight: 600; cursor: pointer; }
            .sos-chat-btn:hover { background: #e2e8f0; }
            @media (max-width: 480px) {
                .techniques-grid { grid-template-columns: 1fr; }
                .sos-actions { flex-direction: column; }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Global instance
const sosHelpSystem = new SOSHelpSystem();
window.SOSHelpSystem = sosHelpSystem;
