// Motivational Messages - Motivasyon Mesajları Sistemi
class MotivationalSystem {
    constructor() {
        this.messages = {
            daily: [
                "Her sigarasız gün, sağlıklı bir geleceğe yapılan bir yatırımdır.",
                "Bugün sigara içmediğin için kendinle gurur duy!",
                "Zorluklar geçicidir, başarın kalıcıdır.",
                "Her 'hayır' demen, bağımlılığa karşı kazanılan bir zaferdir.",
                "Sağlığın için attığın bu adım, en iyi kararın olabilir.",
                "Sigarasız nefes almak, hayatın en güzel hediyelerinden biri.",
                "Bugün bir sigara içmedin, yarın çok daha sağlıklı olacaksın!",
                "Kendine inan, sen bunu başarabilirsin! 💪",
                "Her gün biraz daha güçlü, biraz daha sağlıklı.",
                "Sigara bırakma yolculuğunda her adımın değerli."
            ],
            milestones: {
                1: { title: "🌟 İlk Adım", message: "İlk günün tamamlandı! Bu yolculuğun en zor kısmıydı, şimdi daha da güçlüsün!" },
                3: { title: "⚡ 3 Gün", message: "Nikotin vücudundan tamamen atıldı! Fiziksel bağımlılık sona erdi." },
                7: { title: "🔥 1 Hafta", message: "İlk haftayı tamamladın! Artık sigarasız bir rutin oluşmaya başladı." },
                14: { title: "💪 2 Hafta", message: "Dolaşım sistemin normale dönüyor, akciğer fonksiyonun artıyor!" },
                21: { title: "🎯 3 Hafta", message: "3 hafta sigarasız! Beyin kimyan normale dönüyor." },
                30: { title: "🏆 1 Ay", message: "Tebrikler! 30 gün sigarasız. Akciğerlerin şimdiden iyileşmeye başladı." },
                60: { title: "⭐ 2 Ay", message: "2 ayın sonunda enerjin arttı, cildin parlaklaştı!" },
                90: { title: "👑 3 Ay", message: "Üç ay tamamlandı! Artık bir sigara bırakma ustasısın." },
                100: { title: "💯 100 Gün", message: "100 gün sigarasız! Bu inanılmaz bir başarı!" },
                180: { title: "💎 6 Ay", message: "Yarım yıl sigarasız! Kalbin ve akciğerin için en iyi hediyeyi verdin." },
                365: { title: "🏅 1 Yıl", message: "TAM 1 YIL! Kalp hastalığı riskin yarı yarıya azaldı. Sen bir kahramansın!" }
            },
            cravings: [
                "Bu istek 3-5 dakika içinde geçecek. Derin nefes al ve güçlü kal!",
                "Su iç, kısa bir yürüyüş yap, veya nefes egzersizi yap. İstek geçicidir.",
                "Şimdi sigara içsen pişman olursun, içmesen gurur duyarsın. Seçim senin!",
                "Daha önce bu isteklerle başa çıktın, şimdi de yapabilirsin!",
                "Kendine hatırlat: Neden bıraktığını ve neler kazandığını düşün."
            ],
            health: [
                "20 dakika sonra kalp atış hızın normale dönüyor.",
                "12 saatte kan oksijen seviyen artıyor.",
                "2-12 haftada dolaşım sistem iyileşiyor.",
                "1-9 ayda öksürük ve nefes darlığı azalıyor.",
                "1 yılda kalp krizi riskin yarı yarıya azalıyor!",
                "10 yılda akciğer kanseri riskin yarı yarıya düşüyor."
            ],
            savings: [
                "Birikmiş paranla kendine küçük bir hediye almayı düşün!",
                "Para biriktirmek sadece finansal değil, aynı zamanda sağlık yatırımıdır.",
                "Her sigarasız gün, cebine giren ekstra para demek!",
                "Birikmiş paranla yapabileceklerini hayal et - bu motivasyon kaynağın olsun."
            ]
        };

        this.shownToday = new Set();
        this.initDailyMessage();
    }

    // Günlük mesajı başlat
    initDailyMessage() {
        const today = new Date().toDateString();
        const lastShown = localStorage.getItem('lastMotivationalDate');
        
        if (lastShown !== today) {
            this.shownToday.clear();
            localStorage.setItem('lastMotivationalDate', today);
        }
    }

    // Rastgele mesaj al
    getRandomMessage(category = 'daily') {
        const messages = this.messages[category];
        if (Array.isArray(messages)) {
            const available = messages.filter(m => !this.shownToday.has(m));
            if (available.length === 0) {
                this.shownToday.clear();
                return messages[Math.floor(Math.random() * messages.length)];
            }
            const message = available[Math.floor(Math.random() * available.length)];
            this.shownToday.add(message);
            return message;
        }
        return null;
    }

    // Kilometre taşı mesajı al
    getMilestoneMessage(days) {
        const milestones = Object.keys(this.messages.milestones)
            .map(Number)
            .sort((a, b) => b - a);
        
        for (const milestone of milestones) {
            if (days >= milestone) {
                return this.messages.milestones[milestone];
            }
        }
        return null;
    }

    // İstek anında mesaj
    getCravingMessage() {
        return this.getRandomMessage('cravings');
    }

    // Sağlık mesajı
    getHealthMessage() {
        return this.getRandomMessage('health');
    }

    // Tasarruf mesajı
    getSavingsMessage() {
        return this.getRandomMessage('savings');
    }

    // Widget HTML'i oluştur
    createWidget() {
        const message = this.getRandomMessage('daily');
        const widget = document.createElement('div');
        widget.className = 'motivation-widget';
        widget.innerHTML = `
            <div class="motivation-icon">💡</div>
            <div class="motivation-content">
                <div class="motivation-title">Günün Motivasyonu</div>
                <div class="motivation-text">${message}</div>
            </div>
            <button class="motivation-refresh" title="Yeni mesaj">↻</button>
        `;

        // Styles
        const styles = document.createElement('style');
        styles.textContent = `
            .motivation-widget {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1.5rem;
                border-radius: 16px;
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                margin: 1rem 0;
                position: relative;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            .motivation-icon { font-size: 1.5rem; }
            .motivation-content { flex: 1; }
            .motivation-title { font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem; }
            .motivation-text { font-size: 1rem; font-weight: 500; line-height: 1.5; }
            .motivation-refresh {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s;
            }
            .motivation-refresh:hover { background: rgba(255,255,255,0.3); transform: rotate(180deg); }
        `;
        document.head.appendChild(styles);

        // Refresh handler
        widget.querySelector('.motivation-refresh').addEventListener('click', () => {
            const newMessage = this.getRandomMessage('daily');
            widget.querySelector('.motivation-text').textContent = newMessage;
        });

        return widget;
    }

    // Bildirim olarak göster
    showAsNotification(category = 'daily') {
        const message = this.getRandomMessage(category);
        if (window.NotificationSystem) {
            window.NotificationSystem.showToast(message, 'info', 6000);
        }
    }

    // Tüm mesajları göster
    showAllMessages() {
        console.log('%c 📚 Tüm Motivasyon Mesajları', 'color: #667eea; font-size: 16px; font-weight: bold;');
        Object.entries(this.messages).forEach(([category, msgs]) => {
            console.log(`\n%c ${category.toUpperCase()}`, 'color: #764ba2; font-weight: bold;');
            if (Array.isArray(msgs)) {
                msgs.forEach((msg, i) => console.log(`${i + 1}. ${msg}`));
            } else {
                Object.entries(msgs).forEach(([days, data]) => {
                    console.log(`${days} gün: ${data.title} - ${data.message}`);
                });
            }
        });
    }
}

// Global instance
const motivationalSystem = new MotivationalSystem();
window.MotivationalSystem = motivationalSystem;

// Daily motivation at 9 AM
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 9 && now.getMinutes() === 0) {
        motivationalSystem.showAsNotification('daily');
    }
}, 60000); // Check every minute
