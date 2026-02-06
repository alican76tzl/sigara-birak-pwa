// Form Validation - Form Validasyonu
class FormValidator {
    constructor() {
        this.rules = {
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Geçerli bir e-posta adresi giriniz'
            },
            password: {
                required: true,
                minLength: 6,
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Şifre en az 6 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir'
            },
            fullName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/,
                message: 'Ad soyad sadece harflerden oluşmalıdır'
            },
            phone: {
                required: false,
                pattern: /^(\+90|0)?\s*\d{3}\s*\d{3}\s*\d{2}\s*\d{2}$/,
                message: 'Geçerli bir telefon numarası giriniz (örn: 555 123 4567)'
            }
        };
    }

    // Validate single field
    validateField(fieldName, value) {
        const rule = this.rules[fieldName];
        if (!rule) return { valid: true };

        // Required check
        if (rule.required && (!value || value.trim() === '')) {
            return { valid: false, message: 'Bu alan zorunludur' };
        }

        // If field is not required and empty, it's valid
        if (!rule.required && (!value || value.trim() === '')) {
            return { valid: true };
        }

        // Length checks
        if (rule.minLength && value.length < rule.minLength) {
            return { valid: false, message: `En az ${rule.minLength} karakter giriniz` };
        }

        if (rule.maxLength && value.length > rule.maxLength) {
            return { valid: false, message: `En fazla ${rule.maxLength} karakter giriniz` };
        }

        // Pattern check
        if (rule.pattern && !rule.pattern.test(value)) {
            return { valid: false, message: rule.message };
        }

        return { valid: true };
    }

    // Validate entire form
    validateForm(formData) {
        const errors = {};
        let isValid = true;

        for (const [fieldName, value] of Object.entries(formData)) {
            const result = this.validateField(fieldName, value);
            if (!result.valid) {
                errors[fieldName] = result.message;
                isValid = false;
            }
        }

        return { isValid, errors };
    }

    // Show field error
    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        // Remove existing error
        this.clearFieldError(field);

        // Add error class
        formGroup.classList.add('error');

        // Create error message
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        formGroup.appendChild(errorEl);

        // Shake animation
        formGroup.style.animation = 'shake 0.5s';
        setTimeout(() => {
            formGroup.style.animation = '';
        }, 500);
    }

    // Clear field error
    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('error');
        const errorEl = formGroup.querySelector('.error-message');
        if (errorEl) {
            errorEl.remove();
        }
    }

    // Add real-time validation to field
    addFieldValidation(field, fieldName) {
        field.addEventListener('blur', () => {
            const result = this.validateField(fieldName, field.value);
            if (!result.valid) {
                this.showFieldError(field, result.message);
            } else {
                this.clearFieldError(field);
            }
        });

        field.addEventListener('input', () => {
            // Clear error as user types
            this.clearFieldError(field);
        });
    }

    // Add validation to entire form
    addFormValidation(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            const fieldName = field.name || field.id;
            if (this.rules[fieldName]) {
                this.addFieldValidation(field, fieldName);
            }
        });

        // Form submission validation
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {};
            fields.forEach(field => {
                const name = field.name || field.id;
                if (name) {
                    formData[name] = field.value;
                }
            });

            const result = this.validateForm(formData);
            
            if (result.isValid) {
                // Trigger custom event for successful validation
                form.dispatchEvent(new CustomEvent('formValid', { detail: formData }));
            } else {
                // Show all errors
                fields.forEach(field => {
                    const name = field.name || field.id;
                    if (result.errors[name]) {
                        this.showFieldError(field, result.errors[name]);
                    }
                });

                // Show toast for first error
                const firstError = Object.values(result.errors)[0];
                if (window.showToast) {
                    window.showToast(firstError, 'error');
                }
            }
        });
    }
}

// Add CSS for validation errors
const validationStyles = `
<style>
.form-group.error input,
.form-group.error textarea,
.form-group.error select {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
    animation: slideDown 0.3s ease-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
`;

// Inject styles
if (!document.querySelector('#validation-styles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'validation-styles';
    styleEl.innerHTML = validationStyles;
    document.head.appendChild(styleEl);
}

// Global validator instance
window.formValidator = new FormValidator();
