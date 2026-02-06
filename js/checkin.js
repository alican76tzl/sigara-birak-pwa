// Daily Check-in System - Günlük Giriş Sistemi
class DailyCheckIn {
    constructor() {
        this.questions = [
            {
                id: 'smoked',
                question: 'Bugün sigara içtin mi?',
                type: 'yesno',
                icon: '🚭'
            },
            {
                id: 'cravings',
                question: 'Sigara isteği yaşadın mı?',
                type: 'yesno',
                icon: '💭'
            },
            {
                id: 'exercise',
                question: 'Bugün egzersiz yaptın mı?',
                type: 'yesno',
                icon: '🏃'
            },
            {
                id: 'water',
                question: 'Yeterli su içtin mi? (8 bardak)',
                type: 'yesno',
                icon: '💧'
            },
            {
                id: 'sleep',
                question: 'Dün gece iyi uyudun mu?',
                type: 'yesno',
                icon: '😴'
            }
        ];
    }

    createCheckInCard() {
        const card = document.createElement('div');
        card.className = 'dashboard-card checkin-card';
        
        const todayStatus = this.getTodayStatus();
        const isCompleted = todayStatus && todayStatus.completed;
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">📅 Günlük Kontrol</h3>
                <span class="checkin-date">${new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</span>
            </div>
            <div class="card-content">
                ${isCompleted ? this.renderCompleted(todayStatus) : this.renderQuestions()}
            </div>
        `;

        this.addStyles();
        
        if (!isCompleted) {
            setTimeout(() => this.attachEventListeners(card), 0);
        }

        return card;
    }

    renderQuestions() {
        return `
            <div class="checkin-questions">
                ${this.questions.map((q, index) => `
                    <div class="question-item" data-question="${q.id}" style="--delay: ${index * 0.1}s">
                        <div class="question-icon">${q.icon}</div>
                        <div class="question-text">${q.question}</div>
                        <div class="question-options">
                            <button class="option-btn yes" data-value="true">
                                <span>✓</span> Evet
                            </button>
                            <button class="option-btn no" data-value="false">
                                <span>×</span> Hayır
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="complete-checkin-btn" id="completeCheckIn" disabled>
                Kontrolü Tamamla
            </button>
            <div class="checkin-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="checkinProgress" style="width: 0%"></div>
                </div>
                <span class="progress-text" id="progressText">0/${this.questions.length} soru</span>
            </div>
        `;
    }

    renderCompleted(status) {
        const score = this.calculateScore(status.answers);
        
        return `
            <div class="checkin-completed">
                <div class="completion-badge">
                    <span class="badge-icon">✓</span>
                    <span class="badge-text">Tamamlandı</span>
                </div>
                <div class="score-display">
                    <div class="score-circle" style="--score-color: ${score.color}">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="${score.color}" stroke-width="8" 
                                    stroke-dasharray="283" stroke-dashoffset="${283 - (score.percentage / 100) * 283}" 
                                    stroke-linecap="round" style="transform: rotate(-90deg); transform-origin: center;"/>
                        </svg>
                        <div class="score-value">${score.percentage}%</div>
                    </div>
                    <p class="score-message">${score.message}</p>
                </div>
                <div class="streak-display">
                    <span class="streak-icon">🔥</span>
                    <span class="streak-count">${this.getStreak()} gün seri</span>
                </div>
            </div>
        `;
    }

    attachEventListeners(card) {
        const answers = {};
        let answeredCount = 0;

        card.querySelectorAll('.question-item').forEach(item => {
            const questionId = item.dataset.question;
            
            item.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove selected from siblings
                    item.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                    // Add selected to clicked
                    btn.classList.add('selected');
                    
                    // Save answer
                    answers[questionId] = btn.dataset.value === 'true';
                    
                    // Update progress
                    answeredCount = Object.keys(answers).length;
                    const progress = (answeredCount / this.questions.length) * 100;
                    
                    card.querySelector('#checkinProgress').style.width = `${progress}%`;
                    card.querySelector('#progressText').textContent = `${answeredCount}/${this.questions.length} soru`;
                    
                    // Enable complete button if all answered
                    if (answeredCount === this.questions.length) {
                        const completeBtn = card.querySelector('#completeCheckIn');
                        completeBtn.disabled = false;
                        completeBtn.classList.add('ready');
                    }
                });
            });
        });

        card.querySelector('#completeCheckIn').addEventListener('click', () => {
            this.completeCheckIn(answers, card);
        });
    }

    completeCheckIn(answers, card) {
        const status = {
            date: new Date().toDateString(),
            answers: answers,
            completed: true,
            timestamp: new Date().toISOString()
        };

        // Save
        let history = this.getHistory();
        history = history.filter(h => h.date !== status.date);
        history.push(status);
        localStorage.setItem('checkinHistory', JSON.stringify(history));

        // Show celebration
        this.celebrate(card);
        
        // Refresh after animation
        setTimeout(() => {
            card.querySelector('.card-content').innerHTML = this.renderCompleted(status);
            
            // Show toast
            if (window.NotificationSystem) {
                const score = this.calculateScore(answers);
                window.NotificationSystem.showToast(
                    `Günlük kontrol tamamlandı! Skor: ${score.percentage}%`,
                    'success'
                );
            }
        }, 1000);
    }

    calculateScore(answers) {
        const values = Object.values(answers);
        if (values.length === 0) return { percentage: 0, color: '#94a3b8', message: '' };

        const positive = values.filter(v => v === true).length;
        const percentage = Math.round((positive / values.length) * 100);
        
        let color, message;
        if (percentage >= 80) {
            color = '#22c55e';
            message = 'Harika! Bugün çok iyisin! 🌟';
        } else if (percentage >= 60) {
            color = '#eab308';
            message = 'İyi gidiyorsun, böyle devam et! 💪';
        } else if (percentage >= 40) {
            color = '#f97316';
            message = 'Zorlu bir gün olabilir ama başarabilirsin! 🔥';
        } else {
            color = '#ef4444';
            message = 'Yarın daha iyi bir gün olacak! 🌅';
        }

        return { percentage, color, message };
    }

    getTodayStatus() {
        const history = this.getHistory();
        return history.find(h => h.date === new Date().toDateString());
    }

    getHistory() {
        const saved = localStorage.getItem('checkinHistory');
        return saved ? JSON.parse(saved) : [];
    }

    getStreak() {
        const history = this.getHistory().sort((a, b) => new Date(b.date) - new Date(a.date));
        let streak = 0;
        
        for (let i = 0; i < history.length; i++) {
            if (history[i].completed) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    celebrate(container) {
        const btn = container.querySelector('#completeCheckIn');
        btn.innerHTML = '🎉 Tebrikler!';
        btn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
        
        // Simple animation
        btn.style.transform = 'scale(1.1)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
    }

    addStyles() {
        if (document.getElementById('checkin-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'checkin-styles';
        styles.textContent = `
            .checkin-card .card-header { display: flex; justify-content: space-between; align-items: center; }
            .checkin-date { font-size: 0.875rem; color: #94a3b8; }
            .checkin-questions { display: flex; flex-direction: column; gap: 1rem; }
            .question-item { 
                display: flex; align-items: center; gap: 1rem; padding: 1rem; 
                background: #f8fafc; border-radius: 12px; 
                animation: slideIn 0.3s ease backwards; 
                animation-delay: var(--delay);
            }
            @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
            .question-icon { font-size: 1.5rem; width: 40px; text-align: center; }
            .question-text { flex: 1; font-weight: 500; color: #1e293b; }
            .question-options { display: flex; gap: 0.5rem; }
            .option-btn { 
                display: flex; align-items: center; gap: 0.25rem; 
                padding: 0.5rem 0.75rem; border: 2px solid #e2e8f0; 
                background: white; border-radius: 8px; cursor: pointer; 
                font-size: 0.875rem; font-weight: 500; transition: all 0.2s;
            }
            .option-btn:hover { border-color: #667eea; }
            .option-btn.selected.yes { background: #22c55e; border-color: #22c55e; color: white; }
            .option-btn.selected.no { background: #ef4444; border-color: #ef4444; color: white; }
            .complete-checkin-btn { 
                width: 100%; margin-top: 1rem; padding: 1rem; 
                background: #e2e8f0; color: #94a3b8; border: none; 
                border-radius: 10px; font-weight: 600; font-size: 1rem; 
                cursor: not-allowed; transition: all 0.3s;
            }
            .complete-checkin-btn.ready { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; cursor: pointer;
            }
            .complete-checkin-btn.ready:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
            .checkin-progress { margin-top: 1rem; }
            .progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
            .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.3s; }
            .progress-text { display: block; text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: #64748b; }
            .checkin-completed { text-align: center; padding: 1rem; }
            .completion-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: #22c55e; color: white; padding: 0.5rem 1rem; border-radius: 20px; margin-bottom: 1.5rem; }
            .score-circle { width: 120px; height: 120px; margin: 0 auto 1rem; position: relative; }
            .score-value { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.5rem; font-weight: 700; color: var(--score-color); }
            .score-message { color: #64748b; font-size: 0.95rem; }
            .streak-display { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
            .streak-icon { font-size: 1.25rem; }
            .streak-count { font-weight: 600; color: #f59e0b; }
        `;
        document.head.appendChild(styles);
    }
}

const dailyCheckIn = new DailyCheckIn();
window.DailyCheckIn = dailyCheckIn;
