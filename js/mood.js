// Mood Tracker - Duygu Durumu Takibi
class MoodTracker {
    constructor() {
        this.moods = [
            { emoji: '😄', label: 'Harika', value: 5, color: '#22c55e' },
            { emoji: '🙂', label: 'İyi', value: 4, color: '#84cc16' },
            { emoji: '😐', label: 'Normal', value: 3, color: '#eab308' },
            { emoji: '😕', label: 'Kötü', value: 2, color: '#f97316' },
            { emoji: '😢', label: 'Çok Kötü', value: 1, color: '#ef4444' }
        ];
        this.cravingLevels = [
            { emoji: '🔵', label: 'Yok', value: 0, color: '#3b82f6' },
            { emoji: '🟢', label: 'Hafif', value: 1, color: '#22c55e' },
            { emoji: '🟡', label: 'Orta', value: 2, color: '#eab308' },
            { emoji: '🟠', label: 'Güçlü', value: 3, color: '#f97316' },
            { emoji: '🔴', label: 'Çok Güçlü', value: 4, color: '#ef4444' }
        ];
    }

    // Mood takip kartı oluştur
    createMoodCard() {
        const card = document.createElement('div');
        card.className = 'dashboard-card mood-tracker-card';
        
        const todayEntry = this.getTodayEntry();
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">😊 Bugün Nasıl Hissediyorsun?</h3>
            </div>
            <div class="card-content">
                <div class="mood-section">
                    <label>Duygu Durumun</label>
                    <div class="mood-selector">
                        ${this.moods.map(m => `
                            <button class="mood-btn ${todayEntry?.mood === m.value ? 'selected' : ''}" 
                                    data-mood="${m.value}"
                                    style="--mood-color: ${m.color}">
                                <span class="mood-emoji">${m.emoji}</span>
                                <span class="mood-label">${m.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="craving-section">
                    <label>Sigara İsteği Seviyesi</label>
                    <div class="craving-selector">
                        ${this.cravingLevels.map(c => `
                            <button class="craving-btn ${todayEntry?.craving === c.value ? 'selected' : ''}" 
                                    data-craving="${c.value}"
                                    style="--craving-color: ${c.color}">
                                <span class="craving-emoji">${c.emoji}</span>
                                <span class="craving-label">${c.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="mood-note">
                    <textarea id="moodNote" placeholder="Bugün neler yaşadın? (Opsiyonel)" rows="2">${todayEntry?.note || ''}</textarea>
                </div>

                <button class="save-mood-btn" id="saveMoodBtn">
                    ${todayEntry ? '✓ Güncellendi' : 'Kaydet'}
                </button>

                <div class="mood-history">
                    <h4>Son 7 Gün</h4>
                    <div class="mood-chart" id="moodChart"></div>
                </div>
            </div>
        `;

        this.addStyles();
        
        // Event listeners
        setTimeout(() => {
            // Mood selection
            card.querySelectorAll('.mood-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    card.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });
            });

            // Craving selection
            card.querySelectorAll('.craving-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    card.querySelectorAll('.craving-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });
            });

            // Save button
            card.querySelector('#saveMoodBtn').addEventListener('click', () => this.saveMood(card));

            // Render chart
            this.renderMoodChart(card.querySelector('#moodChart'));
        }, 0);

        return card;
    }

    saveMood(card) {
        const selectedMood = card.querySelector('.mood-btn.selected');
        const selectedCraving = card.querySelector('.craving-btn.selected');
        const note = card.querySelector('#moodNote').value;

        if (!selectedMood || !selectedCraving) {
            this.showToast('Lütfen duygu durumunuzu ve istek seviyenizi seçin', 'warning');
            return;
        }

        const entry = {
            date: new Date().toDateString(),
            mood: parseInt(selectedMood.dataset.mood),
            craving: parseInt(selectedCraving.dataset.craving),
            note: note,
            timestamp: new Date().toISOString()
        };

        // Save to storage
        let history = this.getHistory();
        history = history.filter(h => h.date !== entry.date); // Remove existing entry for today
        history.push(entry);
        localStorage.setItem('moodHistory', JSON.stringify(history));

        // Update button
        const btn = card.querySelector('#saveMoodBtn');
        btn.textContent = '✓ Güncellendi';
        btn.style.background = '#22c55e';

        this.showToast('Duygu durumunuz kaydedildi!', 'success');
        
        // Refresh chart
        this.renderMoodChart(card.querySelector('#moodChart'));

        // Reset button after 2 seconds
        setTimeout(() => {
            btn.textContent = 'Güncelle';
            btn.style.background = '';
        }, 2000);
    }

    getTodayEntry() {
        const history = this.getHistory();
        return history.find(h => h.date === new Date().toDateString());
    }

    getHistory() {
        const saved = localStorage.getItem('moodHistory');
        return saved ? JSON.parse(saved) : [];
    }

    renderMoodChart(container) {
        const history = this.getHistory().slice(-7); // Last 7 days
        
        if (history.length === 0) {
            container.innerHTML = '<p class="no-data">Henüz veri yok</p>';
            return;
        }

        container.innerHTML = `
            <div class="mood-bars">
                ${history.map(h => {
                    const mood = this.moods.find(m => m.value === h.mood);
                    return `
                        <div class="mood-bar-item" title="${h.date}: ${mood.label}">
                            <div class="bar" style="height: ${h.mood * 20}%; background: ${mood.color};"></div>
                            <span class="bar-emoji">${mood.emoji}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    showToast(message, type) {
        if (window.NotificationSystem) {
            window.NotificationSystem.showToast(message, type);
        }
    }

    addStyles() {
        if (document.getElementById('mood-tracker-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'mood-tracker-styles';
        styles.textContent = `
            .mood-tracker-card .card-content { padding: 1.5rem; }
            .mood-section, .craving-section { margin-bottom: 1.5rem; }
            .mood-section label, .craving-section label { display: block; font-weight: 600; color: #1e293b; margin-bottom: 0.75rem; }
            .mood-selector, .craving-selector { display: flex; gap: 0.5rem; flex-wrap: wrap; }
            .mood-btn, .craving-btn { 
                display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
                padding: 0.75rem; border: 2px solid #e2e8f0; background: white; border-radius: 12px;
                cursor: pointer; transition: all 0.2s; min-width: 70px;
            }
            .mood-btn:hover, .craving-btn:hover { border-color: var(--mood-color, var(--craving-color)); transform: translateY(-2px); }
            .mood-btn.selected, .craving-btn.selected { 
                border-color: var(--mood-color, var(--craving-color)); 
                background: var(--mood-color, var(--craving-color)); color: white;
            }
            .mood-emoji, .craving-emoji { font-size: 1.5rem; }
            .mood-label, .craving-label { font-size: 0.75rem; font-weight: 500; }
            .mood-note { margin-bottom: 1rem; }
            .mood-note textarea { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; resize: vertical; font-family: inherit; }
            .mood-note textarea:focus { outline: none; border-color: #667eea; }
            .save-mood-btn { width: 100%; padding: 0.875rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .save-mood-btn:hover { opacity: 0.9; transform: translateY(-1px); }
            .mood-history { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
            .mood-history h4 { font-size: 0.9rem; color: #64748b; margin-bottom: 1rem; }
            .mood-bars { display: flex; align-items: flex-end; gap: 0.5rem; height: 100px; }
            .mood-bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
            .bar { width: 100%; border-radius: 4px 4px 0 0; transition: height 0.3s ease; }
            .bar-emoji { font-size: 1rem; }
            .no-data { text-align: center; color: #94a3b8; font-size: 0.875rem; }
            @media (max-width: 480px) {
                .mood-selector, .craving-selector { justify-content: center; }
                .mood-btn, .craving-btn { min-width: 60px; padding: 0.5rem; }
            }
        `;
        document.head.appendChild(styles);
    }
}

const moodTracker = new MoodTracker();
window.MoodTracker = moodTracker;
