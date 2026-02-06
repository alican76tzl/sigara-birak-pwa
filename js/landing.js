// Landing Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCounterAnimation();
    initPricingToggle();
    initSmoothScroll();
    initScrollAnimations();
});

// Mobile Navigation
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle?.classList.remove('active');
            navLinks?.classList.remove('active');
        });
    });
}

// Counter Animation
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };

    // Intersection Observer for counters
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// Pricing Toggle
function initPricingToggle() {
    const toggleLabels = document.querySelectorAll('.toggle-label');
    const toggleSlider = document.querySelector('.toggle-slider');
    const prices = document.querySelectorAll('.pricing-price .amount');
    const periods = document.querySelectorAll('.pricing-price .period');
    
    toggleLabels.forEach(label => {
        label.addEventListener('click', () => {
            const plan = label.getAttribute('data-plan');
            
            // Update toggle state
            toggleLabels.forEach(l => l.classList.remove('active'));
            label.classList.add('active');
            
            // Move slider
            if (plan === 'yearly') {
                toggleSlider.style.transform = 'translateX(100%)';
            } else {
                toggleSlider.style.transform = 'translateX(0)';
            }
            
            // Update prices
            prices.forEach(price => {
                const monthly = price.getAttribute('data-monthly');
                const yearly = price.getAttribute('data-yearly');
                
                // Animate price change
                price.style.opacity = '0';
                setTimeout(() => {
                    price.textContent = plan === 'yearly' ? yearly : monthly;
                    price.style.opacity = '1';
                }, 200);
            });
            
            // Update period text
            periods.forEach(period => {
                period.textContent = plan === 'yearly' ? '/ay' : '/ay';
            });
        });
    });
}

// Smooth Scroll
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip auth-related hashes - let them work normally for modal
            if (href === '#login' || href === '#register' || href === '#forgot') {
                return; // Don't prevent default, let hash change
            }
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .timeline-item, .pricing-card, .testimonial-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Parallax effect for hero shapes
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.hero-shape');
    
    shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        shape.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Header scroll effect
let lastScroll = 0;
const nav = document.querySelector('.nav-landing');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav?.classList.add('scrolled');
    } else {
        nav?.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});
