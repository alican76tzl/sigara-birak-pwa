// Sigara Bırak - Login Page JavaScript
// Modern, animated, and interactive login functionality

class LoginApp {
    constructor() {
        this.init();
    }

    init() {
        this.cacheElements();
        this.createParticles();
        this.bindEvents();
        this.setupAnimations();
    }

    cacheElements() {
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.forgotForm = document.getElementById('forgotForm');
        this.loginBtn = document.getElementById('loginBtn');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePassword = document.getElementById('togglePassword');
        this.rememberMe = document.getElementById('rememberMe');
        this.particlesContainer = document.getElementById('particles');
        this.toast = document.getElementById('toast');
    }

    // Create floating particles
    createParticles() {
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random positioning and animation
            const size = Math.random() * 4 + 2;
            const left = Math.random() * 100;
            const delay = Math.random() * 20;
            const duration = Math.random() * 10 + 15;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
            `;
            
            this.particlesContainer.appendChild(particle);
        }
    }

    bindEvents() {
        // Form submissions
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        if (this.forgotForm) {
            this.forgotForm.addEventListener('submit', (e) => this.handleForgot(e));
        }

        // Toggle password visibility
        if (this.togglePassword) {
            this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Button ripple effect
        if (this.loginBtn) {
            this.loginBtn.addEventListener('mousemove', (e) => this.handleButtonRipple(e));
        }

        // Input animations
        if (this.emailInput) {
            this.emailInput.addEventListener('focus', () => this.handleInputFocus(this.emailInput));
        }
        if (this.passwordInput) {
            this.passwordInput.addEventListener('focus', () => this.handleInputFocus(this.passwordInput));
        }

        // Social login buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Forgot password link
        const forgotLink = document.querySelector('.forgot-password');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showForgotForm();
            });
        }

        // Signup link
        const signupLink = document.querySelector('.signup-link');
        if (signupLink) {
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showRegisterForm();
            });
        }

        // Back to login links
        document.querySelectorAll('.back-to-login').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showLoginForm();
            });
        });
    }

    showLoginForm() {
        // Use ID to select only the main login form, not all forms with login-form class
        document.getElementById('loginForm').style.display = 'flex';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('forgotForm').style.display = 'none';
        document.querySelector('.divider').style.display = 'flex';
        document.querySelector('.social-login').style.display = 'flex';
        document.querySelector('.signup-section').style.display = 'block';
        document.querySelector('.tagline').textContent = 'Yeni Bir Başlangıç, Sağlıklı Bir Yaşam';
        window.location.hash = 'login';
    }

    showRegisterForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'flex';
        document.getElementById('forgotForm').style.display = 'none';
        document.querySelector('.divider').style.display = 'none';
        document.querySelector('.social-login').style.display = 'none';
        document.querySelector('.signup-section').style.display = 'none';
        document.querySelector('.tagline').textContent = 'Hemen Ücretsiz Kaydolun';
        window.location.hash = 'register';
    }

    showForgotForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('forgotForm').style.display = 'flex';
        document.querySelector('.divider').style.display = 'none';
        document.querySelector('.social-login').style.display = 'none';
        document.querySelector('.signup-section').style.display = 'none';
        document.querySelector('.tagline').textContent = 'Şifrenizi Sıfırlayın';
        window.location.hash = 'forgot';
    }

    setupAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // Observe stat cards
        document.querySelectorAll('.stat-card').forEach(card => {
            observer.observe(card);
        });
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;

        // Validation
        if (!this.validateEmail(email)) {
            this.showToast('Lütfen geçerli bir e-posta adresi giriniz', 'error');
            this.emailInput.focus();
            this.shakeElement(this.emailInput.closest('.input-wrapper'));
            return;
        }

        if (password.length < 6) {
            this.showToast('Şifre en az 6 karakter olmalıdır', 'error');
            this.passwordInput.focus();
            this.shakeElement(this.passwordInput.closest('.input-wrapper'));
            return;
        }

        // Show loading state
        this.setLoading(true);

        try {
            // Supabase login
            const { data, error } = await window.SupabaseConfig.auth.signIn(email, password);

            if (error) throw error;

            // Success
            this.showToast('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
            
            // Store remember me preference
            if (this.rememberMe.checked) {
                localStorage.setItem('rememberEmail', email);
            } else {
                localStorage.removeItem('rememberEmail');
            }

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            this.setLoading(false);
            let errorMsg = 'Giriş başarısız. Lütfen tekrar deneyin.';
            
            if (error.message.includes('Invalid login credentials')) {
                errorMsg = 'E-posta veya şifre hatalı. Lütfen kontrol edin.';
            } else if (error.message.includes('Email not confirmed')) {
                errorMsg = 'E-posta adresiniz henüz onaylanmamış. Lütfen e-postanızı kontrol edin.';
            } else if (error.message) {
                errorMsg = error.message;
            }
            
            this.showToast(errorMsg, 'error');
            this.shakeElement(document.getElementById('loginCard'));
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        if (!name || !email || !password) {
            this.showToast('Lütfen tüm alanları doldurun', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            this.showToast('Şifreler eşleşmiyor', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showToast('Kullanım koşullarını kabul etmelisiniz', 'error');
            return;
        }

        const btn = document.getElementById('registerBtn');
        btn.classList.add('loading');
        btn.disabled = true;

        try {
            // Supabase register
            const { data, error } = await window.SupabaseConfig.auth.signUp(email, password, name);

            if (error) throw error;

            this.showToast('Kayıt başarılı! Lütfen e-postanızı doğrulayın.', 'success');
            
            // Show login form after successful registration
            setTimeout(() => {
                this.showLoginForm();
                // Pre-fill email
                this.emailInput.value = email;
                this.emailInput.dispatchEvent(new Event('input'));
            }, 2000);

        } catch (error) {
            let errorMsg = 'Kayıt başarısız. Lütfen tekrar deneyin.';
            
            if (error.message.includes('already registered')) {
                errorMsg = 'Bu e-posta adresi zaten kayıtlı.';
            } else if (error.message) {
                errorMsg = error.message;
            }
            
            this.showToast(errorMsg, 'error');
        } finally {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    async handleForgot(e) {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value.trim();

        if (!this.validateEmail(email)) {
            this.showToast('Lütfen geçerli bir e-posta adresi giriniz', 'error');
            return;
        }

        const btn = document.getElementById('forgotBtn');
        btn.classList.add('loading');
        btn.disabled = true;

        try {
            // Supabase password reset
            const { data, error } = await window.SupabaseConfig.auth.resetPassword(email);

            if (error) throw error;

            this.showToast('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!', 'success');
            
            setTimeout(() => {
                this.showLoginForm();
            }, 2000);

        } catch (error) {
            this.showToast(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.', 'error');
        } finally {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        this.togglePassword.classList.toggle('active');
    }

    handleButtonRipple(e) {
        const rect = this.loginBtn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        this.loginBtn.style.setProperty('--x', `${x}%`);
        this.loginBtn.style.setProperty('--y', `${y}%`);
    }

    handleInputFocus(input) {
        // Add subtle glow effect
        input.closest('.input-wrapper').style.transform = 'scale(1.02)';
        
        input.addEventListener('blur', () => {
            input.closest('.input-wrapper').style.transform = 'scale(1)';
        }, { once: true });
    }

    handleSocialLogin(e) {
        const provider = e.currentTarget.classList.contains('google') ? 'Google' : 'Apple';
        this.showToast(`${provider} ile giriş yakında aktif olacak!`, 'info');
    }

    setLoading(loading) {
        if (loading) {
            this.loginBtn.classList.add('loading');
            this.loginBtn.disabled = true;
        } else {
            this.loginBtn.classList.remove('loading');
            this.loginBtn.disabled = false;
        }
    }

    shakeElement(element) {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = 'shake 0.5s ease-in-out';
        
        // Add shake keyframes if not exists
        if (!document.getElementById('shake-keyframes')) {
            const style = document.createElement('style');
            style.id = 'shake-keyframes';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showToast(message, type = 'info') {
        const toast = this.toast;
        const icon = toast.querySelector('.toast-icon');
        const msg = toast.querySelector('.toast-message');

        // Set icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };

        icon.textContent = icons[type] || icons.info;
        msg.textContent = message;

        // Remove old classes
        toast.className = 'toast';
        
        // Add new class and show
        setTimeout(() => {
            toast.classList.add('show', type);
        }, 10);

        // Hide after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // Check for stored email
    checkStoredEmail() {
        const storedEmail = localStorage.getItem('rememberEmail');
        if (storedEmail) {
            this.emailInput.value = storedEmail;
            this.rememberMe.checked = true;
            // Trigger label animation
            this.emailInput.dispatchEvent(new Event('input'));
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new LoginApp();
    app.checkStoredEmail();
    
    // Check URL hash and show correct form
    const hash = window.location.hash.replace('#', '');
    if (hash === 'register') {
        app.showRegisterForm();
    } else if (hash === 'forgot') {
        app.showForgotForm();
    } else {
        // Default to login form
        app.showLoginForm();
    }
    
    console.log('%c Sigara Bırak ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; font-size: 20px; font-weight: bold; border-radius: 8px;');
    console.log('%c Giriş sayfası yüklendi! 🚭', 'color: #667eea; font-size: 14px;');
    console.log('%c Demo giriş: demo@sigarabrak.com / demo123', 'color: #48bb78; font-size: 12px;');
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('Çevrimiçi mod');
});

window.addEventListener('offline', () => {
    console.log('Çevrimdışı mod');
});
