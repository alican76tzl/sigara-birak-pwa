// Advanced Health Calculator - Detaylı Sağlık Hesaplayıcı
class HealthCalculator {
    constructor() {
        this.healthBenefits = {
            respiratory: {
                title: 'Solunum Sistemi',
                icon: '🫁',
                improvements: [
                    { day: 1, benefit: 'Karbonmonoksit seviyeleri normalleşmeye başlar', percent: 10 },
                    { day: 2, benefit: 'Nikotin tamamen vücuttan atılır', percent: 20 },
                    { day: 3, benefit: 'Bronşiyal tüpler gevşemeye başlar', percent: 25 },
                    { day: 7, benefit: 'Solunum daha kolay hale gelir', percent: 35 },
                    { day: 14, benefit: 'Akciğer fonksiyonu %30 artar', percent: 50 },
                    { day: 30, benefit: 'Akciğer kapasitesi %10 artar', percent: 60 },
                    { day: 90, benefit: 'Öksürük ve nefes darlığı azalır', percent: 75 },
                    { day: 180, benefit: 'Akciğer fonksiyonu %80 iyileşir', percent: 85 },
                    { day: 365, benefit: 'Akciğer kapasitesi tamamen iyileşir', percent: 100 }
                ]
            },
            cardiovascular: {
                title: 'Kardiyovasküler Sistem',
                icon: '❤️',
                improvements: [
                    { day: 20, benefit: 'Kalp atış hızı normale döner', percent: 15 },
                    { day: 1, benefit: 'Kan basıncı normale döner', percent: 10 },
                    { day: 14, benefit: 'Kalp krizi riski azalmaya başlar', percent: 30 },
                    { day: 30, benefit: 'Kan dolaşımı iyileşir', percent: 45 },
                    { day: 90, benefit: 'Kalp fonksiyonları güçlenir', percent: 60 },
                    { day: 180, benefit: 'Kalp hastalığı riski %50 azalır', percent: 80 },
                    { day: 365, benefit: 'Kalp krizi riski sigara içenle aynı', percent: 100 }
                ]
            },
            cancer: {
                title: 'Kanser Riski',
                icon: '🛡️',
                improvements: [
                    { day: 365, benefit: 'Akciğer kanseri riski %50 azalır', percent: 50 },
                    { day: 1825, benefit: 'Akciğer kanseri riski yarı yarıya düşer', percent: 75 },
                    { day: 3650, benefit: 'Akciğer kanseri riski sigara içmeyenle aynı', percent: 100 },
                    { day: 1825, benefit: 'Ağız ve boğaz kanseri riski %50 azalır', percent: 60 },
                    { day: 3650, benefit: 'Pankreas kanseri riski sigara içmeyenle aynı', percent: 100 }
                ]
            },
            other: {
                title: 'Diğer Faydalar',
                icon: '✨',
                improvements: [
                    { day: 1, benefit: 'Tat ve koku duyusu artar', percent: 20 },
                    { day: 7, benefit: 'Enerji seviyesi yükselir', percent: 40 },
                    { day: 14, benefit: 'Cilt rengi iyileşir', percent: 50 },
                    { day: 30, benefit: 'Bağışıklık sistemi güçlenir', percent: 65 },
                    { day: 90, benefit: 'Dişler beyazlar', percent: 75 },
                    { day: 180, benefit: 'Doğurganlık artar', percent: 85 },
                    { day: 365, benefit: 'Görme kaybı riski azalır', percent: 90 }
                ]
            }
        };
    }

    createHealthCard() {
        const card = document.createElement('div');
        card.className = 'dashboard-card health-calc-card';
        
        const progress = window.DataStorage ? window.DataStorage.calculateProgress() : null;
        const days = progress ? progress.days : 0;
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${this.healthBenefits.respiratory.icon} Sağlık İyileşme Durumu</h3>
            </div>
            <div class="card-content">
                <div class="health-tabs">
                    <button class="health-tab active" data-tab="respiratory">🫁 Solunum</button>
                    <button class="health-tab" data-tab="cardiovascular">❤️ Kalp</button>
                    <button class="health-tab" data-tab="cancer">🛡️ Kanser</button>
                    <button class="health-tab" data-tab="other">✨ Diğer</button>
                </div>
                
                <div class="health-content" id="healthContent">
                    ${this.renderHealthCategory('respiratory', days)}
                </div>
                
                <div class="health-timeline">
                    <h4>Senin İlerlemen</h4>
                    <div class="timeline-visual">
                        ${this.renderTimeline(days)}
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        
        setTimeout(() => {
            // Tab switching
            card.querySelectorAll('.health-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    card.querySelectorAll('.health-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    const category = tab.dataset.tab;
                    card.querySelector('#healthContent').innerHTML = this.renderHealthCategory(category, days);
                });
            });
        }, 0);

        return card;
    }

    renderHealthCategory(category, currentDays) {
        const data = this.healthBenefits[category];
        
        return `
            <div class="health-category">
                <div class="category-header">
                    <span class="cat-icon">${data.icon}</span>
                    <h4>${data.title}</h4>
                </div>
                <div class="improvement-list">
                    ${data.improvements.map(imp => {
                        const achieved = currentDays >= imp.day;
                        const isNext = !achieved && data.improvements.find(i => i.day > currentDays)?.day === imp.day;
                        
                        return `
                            <div class="improvement-item ${achieved ? 'achieved' : ''} ${isNext ? 'next' : ''}">
                                <div class="imp-timeline">
                                    <div class="timeline-dot ${achieved ? 'done' : ''}"></div>
                                    <div class="timeline-line"></div>
                                </div>
                                <div class="imp-content">
                                    <div class="imp-day">${imp.day} gün</div>
                                    <div class="imp-benefit">${imp.benefit}</div>
                                    <div class="imp-progress">
                                        <div class="imp-bar" style="--progress: ${achieved ? 100 : Math.min(100, (currentDays / imp.day) * 100)}%"></div>
                                    </div>
                                </div>
                                <div class="imp-status">
                                    ${achieved ? '✓' : isNext ? '→' : '○'}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderTimeline(days) {
        const milestones = [1, 7, 30, 90, 180, 365];
        const maxDay = Math.max(...milestones);
        
        return `
            <div class="timeline-track">
                <div class="progress-track" style="--progress: ${(days / maxDay) * 100}%"></div>
                ${milestones.map(m => {
                    const position = (m / maxDay) * 100;
                    const achieved = days >= m;
                    return `
                        <div class="milestone-marker ${achieved ? 'achieved' : ''}" style="left: ${position}%">
                            <div class="marker-dot">${achieved ? '✓' : m}</div>
                            <div class="marker-label">${m}g</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="current-position" style="left: ${Math.min(100, (days / maxDay) * 100)}%">
                <div class="position-marker">Sen<br>${days}g</div>
            </div>
        `;
    }

    addStyles() {
        if (document.getElementById('health-calc-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'health-calc-styles';
        styles.textContent = `
            .health-calc-card .card-content { padding: 1.5rem; }
            .health-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
            .health-tab { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; background: white; border-radius: 20px; cursor: pointer; white-space: nowrap; font-size: 0.875rem; transition: all 0.2s; }
            .health-tab:hover { background: #f8fafc; }
            .health-tab.active { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; }
            .health-category { animation: fadeIn 0.3s ease; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .category-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
            .cat-icon { font-size: 1.5rem; }
            .category-header h4 { font-size: 1.1rem; color: #1e293b; }
            .improvement-list { display: flex; flex-direction: column; }
            .improvement-item { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #f1f5f9; position: relative; }
            .improvement-item:last-child { border-bottom: none; }
            .imp-timeline { display: flex; flex-direction: column; align-items: center; width: 24px; }
            .timeline-dot { width: 12px; height: 12px; border-radius: 50%; background: #e2e8f0; border: 2px solid #cbd5e1; }
            .timeline-dot.done { background: #22c55e; border-color: #22c55e; }
            .timeline-line { flex: 1; width: 2px; background: #e2e8f0; margin: 4px 0; }
            .imp-content { flex: 1; }
            .imp-day { font-size: 0.75rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
            .imp-benefit { font-size: 0.95rem; color: #1e293b; margin: 0.25rem 0; }
            .imp-progress { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin-top: 0.5rem; }
            .imp-bar { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); width: var(--progress); transition: width 0.3s; }
            .imp-status { font-size: 1.25rem; color: #94a3b8; }
            .improvement-item.achieved .imp-status { color: #22c55e; }
            .improvement-item.next .imp-status { color: #667eea; animation: pulse 1s infinite; }
            .improvement-item.achieved .imp-benefit { color: #22c55e; text-decoration: line-through; opacity: 0.8; }
            .health-timeline { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
            .health-timeline h4 { font-size: 0.9rem; color: #64748b; margin-bottom: 1rem; }
            .timeline-visual { position: relative; padding: 2rem 0; }
            .timeline-track { position: relative; height: 4px; background: #e2e8f0; border-radius: 2px; }
            .progress-track { position: absolute; left: 0; top: 0; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); width: var(--progress); border-radius: 2px; }
            .milestone-marker { position: absolute; top: -6px; transform: translateX(-50%); text-align: center; }
            .marker-dot { width: 16px; height: 16px; background: white; border: 2px solid #cbd5e1; border-radius: 50%; margin: 0 auto; font-size: 0.6rem; display: flex; align-items: center; justify-content: center; color: #64748b; }
            .milestone-marker.achieved .marker-dot { background: #22c55e; border-color: #22c55e; color: white; }
            .marker-label { font-size: 0.65rem; color: #94a3b8; margin-top: 4px; }
            .current-position { position: absolute; top: -30px; transform: translateX(-50%); text-align: center; }
            .position-marker { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
            @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        `;
        document.head.appendChild(styles);
    }
}

const healthCalculator = new HealthCalculator();
window.HealthCalculator = healthCalculator;
