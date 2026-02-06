// Journal System - Günlük Tutma Sistemi
class JournalSystem {
    constructor() {
        this.prompts = [
            "Bugün sigara isteğin oldu mu? Nasıl başa çıktın?",
            "Bugün kendini nasıl hissettin? Duyguların nelerdi?",
            "Sigara bırakma yolculuğunda bugün neler öğrendin?",
            "Bugün hangi zorluklarla karşılaştın ve nasıl üstesinden geldin?",
            "Kendine ne için gurur duyuyorsun bugün?",
            "Sağlığında fark ettiğin iyileşmeler neler?",
            "Sigara bırakma nedenlerini bir kez daha hatırla...",
            "Bugün seni mutlu eden küçük şeyler nelerdi?",
            "Gelecek için neler hedefliyorsun? Sağlıklı bir yaşam sana ne ifade ediyor?",
            "Başkalarına sigara bırakma konusunda ne tavsiye edersin?"
        ];
    }

    createJournalCard() {
        const card = document.createElement('div');
        card.className = 'dashboard-card journal-card';
        
        const entries = this.getEntries();
        const todayEntry = entries.find(e => e.date === new Date().toDateString());
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">📓 Günlüğüm</h3>
                <button class="new-entry-btn" id="newJournalEntry">+ Yeni Giriş</button>
            </div>
            <div class="card-content">
                ${entries.length === 0 ? this.renderEmptyState() : this.renderEntries(entries.slice(0, 3))}
            </div>
        `;

        this.addStyles();
        
        setTimeout(() => {
            card.querySelector('#newJournalEntry').addEventListener('click', () => {
                this.showJournalModal();
            });
        }, 0);

        return card;
    }

    renderEmptyState() {
        return `
            <div class="journal-empty">
                <div class="empty-icon">📓</div>
                <p>Henüz günlük girişin yok.</p>
                <p class="empty-sub">Düşüncelerini, hislerini ve ilerlemeni kaydetmeye başla.</p>
            </div>
        `;
    }

    renderEntries(entries) {
        return `
            <div class="journal-entries">
                ${entries.map(entry => `
                    <div class="journal-entry" data-id="${entry.id}">
                        <div class="entry-header">
                            <span class="entry-date">${new Date(entry.timestamp).toLocaleDateString('tr-TR', { 
                                day: 'numeric', month: 'long', year: 'numeric' 
                            })}</span>
                            <button class="entry-delete" data-id="${entry.id}">×</button>
                        </div>
                        <div class="entry-preview">${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}</div>
                        ${entry.prompt ? `<div class="entry-prompt">Soru: ${entry.prompt}</div>` : ''}
                        <button class="read-more-btn" data-id="${entry.id}">Devamını Oku →</button>
                    </div>
                `).join('')}
                
                ${this.getEntries().length > 3 ? `
                    <button class="view-all-btn" id="viewAllEntries">Tüm Girişleri Gör (${this.getEntries().length})</button>
                ` : ''}
            </div>
        `;
    }

    showJournalModal(entryId = null) {
        const entry = entryId ? this.getEntries().find(e => e.id === entryId) : null;
        const prompt = !entry ? this.prompts[Math.floor(Math.random() * this.prompts.length)] : '';
        
        const modal = document.createElement('div');
        modal.className = 'journal-modal';
        modal.innerHTML = `
            <div class="journal-overlay"></div>
            <div class="journal-modal-content">
                <div class="journal-modal-header">
                    <h3>${entry ? 'Günlük Girişi' : 'Yeni Günlük Girişi'}</h3>
                    <button class="modal-close">×</button>
                </div>
                
                <div class="journal-form">
                    ${!entry && prompt ? `
                        <div class="journal-prompt">
                            <span class="prompt-icon">💭</span>
                            <p>${prompt}</p>
                        </div>
                    ` : ''}
                    
                    <textarea id="journalContent" rows="8" placeholder="Düşüncelerini yaz...">${entry ? entry.content : ''}</textarea>
                    
                    <div class="journal-tags">
                        <label>Etiketler:</label>
                        <div class="tag-options">
                            ${['Motivasyon', 'Zorluk', 'Başarı', 'Sağlık', 'Duygu'].map(tag => `
                                <button class="tag-btn ${entry?.tags?.includes(tag) ? 'selected' : ''}" data-tag="${tag}">${tag}</button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="journal-actions">
                        <button class="cancel-btn" id="cancelJournal">İptal</button>
                        <button class="save-btn" id="saveJournal">${entry ? 'Güncelle' : 'Kaydet'}</button>
                    </div>
                </div>
            </div>
        `;

        this.addModalStyles();
        document.body.appendChild(modal);

        // Event handlers
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.journal-overlay');
        const cancelBtn = modal.querySelector('#cancelJournal');
        const saveBtn = modal.querySelector('#saveJournal');
        
        const selectedTags = new Set(entry?.tags || []);
        
        // Tag selection
        modal.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                if (selectedTags.has(tag)) {
                    selectedTags.delete(tag);
                    btn.classList.remove('selected');
                } else {
                    selectedTags.add(tag);
                    btn.classList.add('selected');
                }
            });
        });

        const close = () => modal.remove();

        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);
        cancelBtn.addEventListener('click', close);

        saveBtn.addEventListener('click', () => {
            const content = modal.querySelector('#journalContent').value.trim();
            if (!content) {
                this.showToast('Lütfen bir şeyler yazın', 'warning');
                return;
            }

            if (entry) {
                this.updateEntry(entry.id, content, Array.from(selectedTags));
            } else {
                this.addEntry(content, prompt, Array.from(selectedTags));
            }
            
            close();
            this.refreshJournalCard();
        });
    }

    addEntry(content, prompt, tags) {
        const entries = this.getEntries();
        const entry = {
            id: Date.now(),
            date: new Date().toDateString(),
            content: content,
            prompt: prompt,
            tags: tags,
            timestamp: new Date().toISOString()
        };
        
        entries.unshift(entry);
        localStorage.setItem('journalEntries', JSON.stringify(entries));
        
        this.showToast('Günlük girişi kaydedildi!', 'success');
        
        // Add activity
        if (window.DataStorage) {
            window.DataStorage.addActivity('journal_entry', 'Günlüğe yeni giriş yapıldı', 'book');
        }
    }

    updateEntry(id, content, tags) {
        const entries = this.getEntries();
        const entry = entries.find(e => e.id === id);
        if (entry) {
            entry.content = content;
            entry.tags = tags;
            localStorage.setItem('journalEntries', JSON.stringify(entries));
            this.showToast('Günlük girişi güncellendi!', 'success');
        }
    }

    deleteEntry(id) {
        let entries = this.getEntries();
        entries = entries.filter(e => e.id !== id);
        localStorage.setItem('journalEntries', JSON.stringify(entries));
        this.showToast('Giriş silindi', 'info');
        this.refreshJournalCard();
    }

    getEntries() {
        const saved = localStorage.getItem('journalEntries');
        return saved ? JSON.parse(saved) : [];
    }

    refreshJournalCard() {
        const oldCard = document.querySelector('.journal-card');
        if (oldCard) {
            const newCard = this.createJournalCard();
            oldCard.replaceWith(newCard);
        }
    }

    showToast(message, type) {
        if (window.NotificationSystem) {
            window.NotificationSystem.showToast(message, type);
        }
    }

    addStyles() {
        if (document.getElementById('journal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'journal-styles';
        styles.textContent = `
            .journal-card .card-header { display: flex; justify-content: space-between; align-items: center; }
            .new-entry-btn { padding: 0.5rem 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; transition: transform 0.2s; }
            .new-entry-btn:hover { transform: translateY(-2px); }
            .journal-empty { text-align: center; padding: 2rem; }
            .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
            .journal-empty p { color: #64748b; margin-bottom: 0.5rem; }
            .empty-sub { font-size: 0.875rem; }
            .journal-entries { display: flex; flex-direction: column; gap: 1rem; }
            .journal-entry { background: #f8fafc; border-radius: 12px; padding: 1rem; }
            .entry-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
            .entry-date { font-size: 0.875rem; font-weight: 600; color: #1e293b; }
            .entry-delete { background: none; border: none; color: #94a3b8; font-size: 1.25rem; cursor: pointer; }
            .entry-delete:hover { color: #ef4444; }
            .entry-preview { color: #64748b; font-size: 0.9rem; line-height: 1.5; margin-bottom: 0.5rem; }
            .entry-prompt { font-size: 0.8rem; color: #94a3b8; font-style: italic; margin-bottom: 0.5rem; }
            .read-more-btn { background: none; border: none; color: #667eea; font-size: 0.875rem; cursor: pointer; font-weight: 500; }
            .read-more-btn:hover { text-decoration: underline; }
            .view-all-btn { width: 100%; padding: 0.75rem; background: #f1f5f9; border: none; border-radius: 8px; color: #64748b; cursor: pointer; margin-top: 0.5rem; }
            .view-all-btn:hover { background: #e2e8f0; }
        `;
        document.head.appendChild(styles);
    }

    addModalStyles() {
        if (document.getElementById('journal-modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'journal-modal-styles';
        styles.textContent = `
            .journal-modal { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; }
            .journal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
            .journal-modal-content { position: relative; background: white; border-radius: 20px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; animation: journalSlideUp 0.3s ease; }
            @keyframes journalSlideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .journal-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
            .journal-modal-header h3 { font-size: 1.25rem; color: #1e293b; }
            .modal-close { background: #f1f5f9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; color: #64748b; }
            .journal-form { padding: 1.5rem; }
            .journal-prompt { background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; display: flex; gap: 0.75rem; }
            .prompt-icon { font-size: 1.5rem; }
            .journal-prompt p { color: #1e293b; font-size: 0.95rem; line-height: 1.5; }
            #journalContent { width: 100%; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; font-family: inherit; font-size: 1rem; resize: vertical; min-height: 150px; }
            #journalContent:focus { outline: none; border-color: #667eea; }
            .journal-tags { margin-top: 1rem; }
            .journal-tags label { display: block; font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem; }
            .tag-options { display: flex; flex-wrap: wrap; gap: 0.5rem; }
            .tag-btn { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; background: white; border-radius: 20px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; }
            .tag-btn.selected { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-color: transparent; }
            .journal-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
            .cancel-btn { flex: 1; padding: 0.875rem; background: #f1f5f9; border: none; border-radius: 10px; color: #64748b; font-weight: 600; cursor: pointer; }
            .save-btn { flex: 1; padding: 0.875rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }
        `;
        document.head.appendChild(styles);
    }
}

const journalSystem = new JournalSystem();
window.JournalSystem = journalSystem;
