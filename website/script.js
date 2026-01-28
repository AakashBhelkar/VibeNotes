// VibeNotes Marketing Website JavaScript

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all feature cards and pricing cards
document.querySelectorAll('.feature-card, .pricing-card').forEach(card => {
    observer.observe(card);
});

// Add scroll effect to navigation
let lastScroll = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        nav.classList.remove('scroll-up');
        return;
    }

    if (currentScroll > lastScroll && !nav.classList.contains('scroll-down')) {
        // Scrolling down
        nav.classList.remove('scroll-up');
        nav.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && nav.classList.contains('scroll-down')) {
        // Scrolling up
        nav.classList.remove('scroll-down');
        nav.classList.add('scroll-up');
    }

    lastScroll = currentScroll;
});

// Track CTA clicks (placeholder for analytics)
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', (e) => {
        // Analytics tracking would go here
        console.log('CTA clicked:', e.target.textContent);
    });
});

// Pricing card hover effect enhancement
document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Mobile menu toggle (if needed in future)
const createMobileMenu = () => {
    const navLinks = document.querySelector('.nav-links');
    const menuButton = document.createElement('button');
    menuButton.className = 'mobile-menu-button';
    menuButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    `;

    menuButton.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
    });

    // Only add on mobile
    if (window.innerWidth <= 768) {
        document.querySelector('.nav-content').appendChild(menuButton);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('VibeNotes Marketing Site Loaded');

    // Add loading animation complete class
    document.body.classList.add('loaded');
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Responsive adjustments if needed
        console.log('Window resized');
    }, 250);
});

// Prefetch app route for faster navigation
const prefetchApp = () => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = '/client';
    document.head.appendChild(link);
};

// Prefetch after page load
window.addEventListener('load', () => {
    setTimeout(prefetchApp, 2000);
});

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join(',') === konamiSequence.join(',')) {
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});
