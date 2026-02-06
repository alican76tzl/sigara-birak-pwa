// Production Logger - Conditional console.log wrapper
// Sadece development ortamında console.log gösterir

const isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168');

// Logger utility
const logger = {
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    error: (...args) => {
        // Errors always shown
        console.error(...args);
    },
    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    debug: (...args) => {
        if (isDevelopment) {
            console.debug(...args);
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = logger;
} else {
    window.logger = logger;
}
