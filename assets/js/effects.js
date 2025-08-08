// Cool Visual Effects for Xenargs Softworks
// Handles starfield, animations, and interactive effects

(function() {
  'use strict';

  // Performance and accessibility checks
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = /Mobi|Android/i.test(navigator.userAgent) && window.innerWidth <= 768;

  // Starfield Background Effect
  function initStarfield() {
    const canvas = document.getElementById('stars');
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0, stars = [], rafId = 0;
    const animateStars = !isTouch; // Static on touch devices for smoother scroll

    function resize() {
      const viewport = window.visualViewport;
      const innerW = window.innerWidth;
      const innerH = viewport ? Math.max(window.innerHeight, Math.ceil(viewport.height)) : window.innerHeight;
      
      // Responsive canvas sizing
      const isMobile = innerW <= 480;
      const isTablet = innerW > 480 && innerW <= 768;
      
      if (isMobile) {
        width = innerW * 3;
        height = innerH * 4;
        canvas.style.width = (innerW * 3) + 'px';
        canvas.style.height = (innerH * 4) + 'px';
        canvas.style.left = (-innerW) + 'px';
        canvas.style.top = (-innerH * 2) + 'px';
      } else if (isTablet) {
        width = innerW * 2.5;
        height = innerH * 3;
        canvas.style.width = (innerW * 2.5) + 'px';
        canvas.style.height = (innerH * 3) + 'px';
        canvas.style.left = (-innerW * 0.75) + 'px';
        canvas.style.top = (-innerH * 1.5) + 'px';
      } else {
        width = innerW * 2;
        height = innerH * 2;
        canvas.style.width = (innerW * 2) + 'px';
        canvas.style.height = (innerH * 2) + 'px';
        canvas.style.left = (-innerW / 2) + 'px';
        canvas.style.top = (-innerH) + 'px';
      }
      
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      
      // Generate stars
      const area = width * height;
      const isSmall = width <= 480;
      const base = isSmall ? (area / 16000) : (area / 10000);
      const cap = isSmall ? (isTouch ? 90 : 130) : (isTouch ? 140 : 220);
      const starCount = Math.min(Math.floor(base), cap);
      
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * Math.PI * 2,
        s: Math.random() * 0.4 + 0.05,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      
      for (const star of stars) {
        if (animateStars) star.a += star.s * 0.02;
        const twinkle = animateStars ? (0.3 + Math.abs(Math.sin(star.a)) * 0.7) : 0.6;
        ctx.globalAlpha = twinkle * 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      if (animateStars) rafId = requestAnimationFrame(draw);
    }

    // Initialize
    resize();
    const start = () => { draw(); };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(start, { timeout: 800 });
    } else {
      start();
    }

    // Event listeners
    const handleResize = () => {
      if (animateStars) cancelAnimationFrame(rafId);
      resize();
      draw();
    };
    
    window.addEventListener('resize', handleResize);
    if ('visualViewport' in window) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    // Pause when tab hidden for performance
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (animateStars) {
        draw();
      }
    });
  }

  // Smooth Scroll Reveal Effect
  function initScrollReveal() {
    if (reduceMotion) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
        }
      });
    }, observerOptions);

    // Observe all elements with 'reveal' class
    document.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el);
    });
  }

  // Interactive Glow Effect
  function initGlowEffect() {
    if (reduceMotion || isTouch) return;

    const card = document.querySelector('.card');
    if (!card) return;

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;

    function updateGlow(e) {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      mouseX = (e.clientX - centerX) / (rect.width / 2);
      mouseY = (e.clientY - centerY) / (rect.height / 2);
    }

    function animateGlow() {
      currentX += (mouseX - currentX) * 0.1;
      currentY += (mouseY - currentY) * 0.1;
      
      const intensity = Math.max(0, 0.3 - Math.sqrt(currentX * currentX + currentY * currentY) * 0.2);
      
      card.style.setProperty('--glow-x', currentX);
      card.style.setProperty('--glow-y', currentY);
      card.style.setProperty('--glow-intensity', intensity);
      
      requestAnimationFrame(animateGlow);
    }

    window.addEventListener('mousemove', updateGlow);
    window.addEventListener('mouseleave', () => {
      mouseX = 0;
      mouseY = 0;
    });

    animateGlow();
  }

  // Balatro-style Card Tilt Effect
  function initCardTilt() {
    if (reduceMotion) return;

    const cards = document.querySelectorAll('main.card');
    if (!cards.length) return;

    cards.forEach(card => {
      let mouseX = 0, mouseY = 0;
      let currentX = 0, currentY = 0;
      let isHovering = false;

      function updateTilt(e) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate mouse position relative to card center
        mouseX = (e.clientX - centerX) / (rect.width / 2);
        mouseY = (e.clientY - centerY) / (rect.height / 2);
        
        // Clamp values to prevent extreme tilts
        mouseX = Math.max(-1, Math.min(1, mouseX));
        mouseY = Math.max(-1, Math.min(1, mouseY));
      }

      function animateTilt() {
        // Smooth interpolation for natural movement
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        
        // Apply 3D transform with perspective
        const rotateX = -currentY * 15; // Tilt up/down (increased from 8)
        const rotateY = currentX * 15;  // Tilt left/right (increased from 8)
        const translateZ = isHovering ? 30 : 0; // Slight lift when hovering (increased from 20)
        
        card.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateZ(${translateZ}px)
        `;
        
        // Add subtle shadow based on tilt
        const shadowX = currentX * 20; // Increased from 10
        const shadowY = currentY * 20; // Increased from 10
        const shadowBlur = isHovering ? 40 : 25; // Increased blur
        
        card.style.boxShadow = `
          0 10px 40px rgba(0,0,0,0.35),
          inset 0 1px 0 rgba(255,255,255,0.06),
          0 0 20px rgba(124, 58, 237, calc(var(--glow-intensity) * 0.3)),
          0 0 40px rgba(6, 182, 212, calc(var(--glow-intensity) * 0.2)),
          ${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.3)
        `;
        
        requestAnimationFrame(animateTilt);
      }

      // Mouse enter
      card.addEventListener('mouseenter', () => {
        isHovering = true;
      });

      // Mouse move
      card.addEventListener('mousemove', updateTilt);

      // Mouse leave
      card.addEventListener('mouseleave', () => {
        isHovering = false;
        mouseX = 0;
        mouseY = 0;
      });

      // Start animation
      animateTilt();
    });
  }

  // Typing Effect for Headlines
  function initTypingEffect() {
    if (reduceMotion) return;

    const headlines = document.querySelectorAll('h1');
    headlines.forEach(headline => {
      const text = headline.textContent;
      headline.textContent = '';
      headline.style.opacity = '1';
      
      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          headline.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 50);
        }
      };
      
      // Start typing after a short delay
      setTimeout(typeWriter, 500);
    });
  }

  // Dropdown functionality
  function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const faqToggles = document.querySelectorAll('.faq-toggle');
    
    // Function to close all dropdowns of a specific type
    function closeAllDropdowns(toggles, contentSelector) {
      toggles.forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
        const contentId = toggle.getAttribute('aria-controls');
        const content = document.getElementById(contentId);
        if (content) {
          content.classList.remove('open');
        }
      });
    }
    
    // Function to toggle a dropdown
    function toggleDropdown(toggle, content, isExpanded) {
      if (isExpanded) {
        toggle.setAttribute('aria-expanded', 'false');
        content.classList.remove('open');
      } else {
        toggle.setAttribute('aria-expanded', 'true');
        content.classList.add('open');
      }
    }
    
    // Main dropdown toggles (FAQ section)
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const contentId = this.getAttribute('aria-controls');
        const content = document.getElementById(contentId);
        
        if (!content) return;
        
        // Close all other main dropdowns
        dropdownToggles.forEach(otherToggle => {
          if (otherToggle !== this) {
            const otherContentId = otherToggle.getAttribute('aria-controls');
            const otherContent = document.getElementById(otherContentId);
            if (otherContent) {
              otherToggle.setAttribute('aria-expanded', 'false');
              otherContent.classList.remove('open');
            }
          }
        });
        
        // Toggle current dropdown
        toggleDropdown(this, content, isExpanded);
      });
      
      // Add keyboard support
      toggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
    
    // FAQ question toggles (nested dropdowns)
    faqToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const contentId = this.getAttribute('aria-controls');
        const content = document.getElementById(contentId);
        
        if (!content) return;
        
        // Close all other FAQ toggles
        faqToggles.forEach(otherToggle => {
          if (otherToggle !== this) {
            const otherContentId = otherToggle.getAttribute('aria-controls');
            const otherContent = document.getElementById(otherContentId);
            if (otherContent) {
              otherToggle.setAttribute('aria-expanded', 'false');
              otherContent.classList.remove('open');
            }
          }
        });
        
        // Toggle current FAQ
        toggleDropdown(this, content, isExpanded);
      });
      
      // Add keyboard support
      toggle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  // Initialize all effects when DOM is ready
  function initEffects() {
    initStarfield();
    initScrollReveal();
    initGlowEffect();
    initCardTilt();
    initTypingEffect();
    initDropdowns();
  }

  // Start effects when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEffects);
  } else {
    initEffects();
  }

})();
