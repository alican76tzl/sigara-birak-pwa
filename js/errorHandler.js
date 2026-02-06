// Global Error Handler - Global Hata Yöneticisi
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
        this.retryAttempts = {};
        this.init();
    }

    init() {
        // Global error handlers
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack
            });
        });

        // Supabase specific error handling
        this.setupSupabaseErrorHandling();
    }

    setupSupabaseErrorHandling() {
        // Override console methods for better error tracking
        const originalError = console.error;
        console.error = (...args) => {
            originalError.apply(console, args);
            
            // Check if it's a Supabase error
            const message = args.join(' ');
            if (message.includes('Supabase') || message.includes('supabase')) {
                this.handleError({
                    type: 'supabase',
                    message: message,
                    context: 'supabase_operation'
                });
            }
        };
    }

    handleError(error) {
        // Add timestamp
        error.timestamp = new Date().toISOString();
        error.userAgent = navigator.userAgent;
        error.url = window.location.href;

        // Store error
        this.errors.push(error);
        
        // Keep only last N errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        // Log to console
        this.logError(error);

        // Show user-friendly message
        this.showUserError(error);

        // Send to monitoring service (in production)
        this.reportError(error);
    }

    logError(error) {
        const logMessage = `[${error.type?.toUpperCase() || 'ERROR'}] ${error.message}`;
        
        if (error.stack) {
            console.groupCollapsed(logMessage);
            console.error(error.stack);
            console.groupEnd();
        } else {
            console.error(logMessage);
        }
    }

    showUserError(error) {
        // Don't show every error to user
        if (error.type === 'javascript' && error.filename?.includes('third-party')) {
            return;
        }

        let message = 'Bir hata oluştu. Lütfen sayfayı yenileyin.';
        
        // Specific error messages
        if (error.type === 'supabase') {
            if (error.message.includes('Invalid login')) {
                message = 'E-posta veya şifre hatalı. Lütfen kontrol edin.';
            } else if (error.message.includes('Email not confirmed')) {
                message = 'E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin.';
            } else if (error.message.includes('Network')) {
                message = 'İnternet bağlantınızda sorun var. Lütfen bağlantınızı kontrol edin.';
            } else if (error.message.includes('Database')) {
                message = 'Veritabanı hatası. Lütfen daha sonra tekrar deneyin.';
            }
        } else if (error.type === 'promise') {
            message = 'İşlem tamamlanamadı. Lütfen tekrar deneyin.';
        }

        // Show toast if available
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            // Fallback alert
            console.warn('Toast not available, using alert');
            // alert(message); // Commented out to avoid spam
        }
    }

    reportError(error) {
        // In production, send to error monitoring service
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Example: Send to Sentry, LogRocket, etc.
            // this.sendToMonitoringService(error);
        }
    }

    // Retry mechanism for failed operations
    async retry(operation, maxRetries = 3, delay = 1000) {
        const operationId = operation.toString();
        
        if (!this.retryAttempts[operationId]) {
            this.retryAttempts[operationId] = 0;
        }

        try {
            const result = await operation();
            // Reset retry counter on success
            delete this.retryAttempts[operationId];
            return result;
        } catch (error) {
            this.retryAttempts[operationId]++;
            
            if (this.retryAttempts[operationId] >= maxRetries) {
                this.handleError({
                    type: 'retry_failed',
                    message: `Operation failed after ${maxRetries} attempts: ${error.message}`,
                    originalError: error,
                    attempts: this.retryAttempts[operationId]
                });
                delete this.retryAttempts[operationId];
                throw error;
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay * this.retryAttempts[operationId]));
            
            return this.retry(operation, maxRetries, delay);
        }
    }

    // Get error statistics
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byType: {},
            recent: this.errors.slice(-10)
        };

        this.errors.forEach(error => {
            const type = error.type || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        return stats;
    }

    // Clear errors
    clearErrors() {
        this.errors = [];
        this.retryAttempts = {};
    }

    // Export errors for debugging
    exportErrors() {
        return JSON.stringify(this.errors, null, 2);
    }
}

// Enhanced async function wrapper
function safeAsync(fn, errorHandler = null) {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            if (errorHandler) {
                errorHandler(error);
            } else if (window.errorHandler) {
                window.errorHandler.handleError({
                    type: 'async_function',
                    message: error.message,
                    stack: error.stack,
                    functionName: fn.name || 'anonymous'
                });
            }
            throw error;
        }
    };
}

// Safe fetch wrapper
async function safeFetch(url, options = {}, retries = 2) {
    if (window.errorHandler) {
        return window.errorHandler.retry(async () => {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return response;
        }, retries);
    }
    
    // Fallback
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
}

// Initialize global error handler
window.errorHandler = new ErrorHandler();

// Export for use in other modules
window.safeAsync = safeAsync;
window.safeFetch = safeFetch;

// Development helper
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.errorStats = () => {
        console.table(window.errorHandler.getErrorStats());
    };
    
    window.exportErrors = () => {
        console.log(window.errorHandler.exportErrors());
    };
    
    window.clearErrors = () => {
        window.errorHandler.clearErrors();
        console.log('Errors cleared');
    };
}
