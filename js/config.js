// Configuration - Güvenli yapılandırma
// Production'da bu değerler environment variables'dan alınmalı

const CONFIG = {
    // Supabase Configuration
    SUPABASE: {
        URL: 'https://xvgqgtlknmirwhgzxpxp.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3FndGxrbm1pcndoZ3p4cHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzkyNzMsImV4cCI6MjA4NTkxNTI3M30.vGZLTLu-3m-hHXg0tstuC2kBSG54T_bEZQYjoIqDIK4'
    },
    
    // App Configuration
    APP: {
        NAME: 'Sigara Bırak',
        VERSION: '1.0.0',
        API_TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3
    },
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        USER: 'sb_user',
        PROGRESS: 'sb_progress', 
        SETTINGS: 'sb_settings',
        ACHIEVEMENTS: 'sb_achievements',
        ACTIVITIES: 'sb_activities',
        QUIT_DATE: 'sb_quitDate',
        CIGARETTES_PER_DAY: 'sb_cigarettesPerDay',
        PRICE_PER_PACK: 'sb_pricePerPack'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
