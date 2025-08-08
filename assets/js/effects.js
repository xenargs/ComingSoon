// Cool Visual Effects for Xenargs Softworks
// Handles starfield, animations, and interactive effects

(function() {
  'use strict';

  // Performance and accessibility checks
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = /Mobi|Android/i.test(navigator.userAgent);

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

  // Particle Trail Effect
  function initParticleTrail() {
    if (reduceMotion || isTouch) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const particles = [];
    let mouseX = 0, mouseY = 0;
    let isMoving = false;

    function resize() {
      canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
      canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    function createParticle(x, y) {
      return {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        size: Math.random() * 3 + 1
      };
    }

    function updateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add new particles when mouse is moving
      if (isMoving && Math.random() < 0.3) {
        particles.push(createParticle(mouseX, mouseY));
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.size *= 0.99;

        if (p.life <= 0 || p.size < 0.1) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = `hsl(${200 + p.life * 60}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(updateParticles);
    }

    let moveTimeout;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;
      
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => {
        isMoving = false;
      }, 100);
    });

    resize();
    updateParticles();
    window.addEventListener('resize', resize);
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

  // Floating Animation for Elements
  function initFloatingElements() {
    if (reduceMotion) return;

    const floatingElements = document.querySelectorAll('.logo, .value-props li');
    
    floatingElements.forEach((el, index) => {
      el.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
      el.style.animationDelay = `${index * 0.2}s`;
    });
  }

  // Initialize all effects when DOM is ready
  function initEffects() {
    initStarfield();
    initScrollReveal();
    initGlowEffect();
    initParticleTrail();
    initTypingEffect();
    initFloatingElements();
  }

  // Start effects when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEffects);
  } else {
    initEffects();
  }

})();
