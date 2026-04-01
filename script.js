/* ============================================================
   DISCONNECTED — Main JavaScript
   Scroll animations, nav behavior, accordion, mobile nav
   ============================================================ */

(function () {
  'use strict';

  /* ---- PAGE LOADER ---- */
  const loader = document.querySelector('.site-loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('loaded'), 400);
    });
  }

  /* ---- NAVIGATION SCROLL STATE ---- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- MOBILE NAV ---- */
  const mobileToggle = document.querySelector('.nav__mobile-toggle');
  const mobileNav    = document.querySelector('.mobile-nav');
  const mobileClose  = document.querySelector('.mobile-nav__close');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    const closeMenu = () => {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (mobileClose) mobileClose.addEventListener('click', closeMenu);

    mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ---- SCROLL REVEAL ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---- STAGGER CHILDREN ON REVEAL ---- */
  const staggerEls = document.querySelectorAll('.stagger');
  if (staggerEls.length) {
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const children = entry.target.querySelectorAll('.reveal');
            children.forEach((child, i) => {
              setTimeout(() => child.classList.add('revealed'), i * 100);
            });
            staggerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    staggerEls.forEach(el => staggerObserver.observe(el));
  }

  /* ---- PARALLAX (subtle, performance-safe) ---- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const parallaxHandler = () => {
      const scrollY = window.scrollY;
      parallaxEls.forEach(el => {
        const speed  = parseFloat(el.dataset.parallax) || 0.3;
        const rect   = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (window.innerHeight / 2 - center) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
    };
    window.addEventListener('scroll', parallaxHandler, { passive: true });
    parallaxHandler();
  }

  /* ---- ACCORDION ---- */
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const body     = trigger.nextElementSibling;

      // Close all others in same accordion
      const accordion = trigger.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion__trigger').forEach(t => {
          if (t !== trigger) {
            t.setAttribute('aria-expanded', 'false');
            const b = t.nextElementSibling;
            if (b) b.classList.remove('open');
          }
        });
      }

      trigger.setAttribute('aria-expanded', String(!expanded));
      if (body) body.classList.toggle('open', !expanded);
    });
  });

  /* ---- SMOOTH ANCHOR SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- TEXT SCRAMBLE (for hero title letters) ---- */
  class TextScramble {
    constructor(el) {
      this.el     = el;
      this.chars  = '!<>-_\\/[]{}—=+*^?#ABCDEF';
      this.update = this.update.bind(this);
    }
    setText(newText) {
      const old    = this.el.innerText;
      const len    = Math.max(old.length, newText.length);
      const frames = len * 3;
      let frame    = 0;
      const queue  = Array.from({ length: len }, (_, i) => ({
        from : old[i] || '',
        to   : newText[i] || '',
        start: Math.floor(Math.random() * frames * 0.5),
        end  : Math.floor(Math.random() * frames * 0.5 + frames * 0.5),
        char : '',
      }));
      this.resolve = () => {};
      const promise = new Promise(res => (this.resolve = res));
      const tick = () => {
        let output  = '';
        let complete = 0;
        for (let i = 0; i < queue.length; i++) {
          const { from, to, start, end } = queue[i];
          if (frame >= end) {
            complete++;
            output += to;
          } else if (frame >= start) {
            if (!queue[i].char || Math.random() < 0.28) {
              queue[i].char = this.chars[Math.floor(Math.random() * this.chars.length)];
            }
            output += `<span style="color:var(--amber);opacity:0.6">${queue[i].char}</span>`;
          } else {
            output += from;
          }
        }
        this.el.innerHTML = output;
        if (complete === queue.length) { this.resolve(); return; }
        frame++;
        this.raf = requestAnimationFrame(tick);
      };
      tick();
      return promise;
    }
  }

  // Apply scramble to elements with data-scramble attribute
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const original = el.textContent.trim();
    const scramble = new TextScramble(el);
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          scramble.setText(original);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ---- COUNTER ANIMATION ---- */
  document.querySelectorAll('[data-count]').forEach(el => {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const duration = 1600;
    let started    = false;

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const tick = (now) => {
            const pct = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - pct, 3); // ease out cubic
            const val  = target * ease;
            el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
            if (pct < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* ---- ACTIVE NAV LINK ---- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .footer__link').forEach(link => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === currentPath) {
      link.style.color = 'var(--amber)';
    }
  });

  /* ---- FORM SUBMISSION (placeholder) ---- */
  const bookingForm = document.querySelector('.booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = bookingForm.querySelector('[type="submit"]');
      if (!btn) return;
      const original = btn.textContent;
      btn.textContent = 'Sent — We\'ll be in touch soon.';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled    = false;
        btn.style.opacity = '';
        bookingForm.reset();
      }, 5000);
    });
  }

  /* ---- CURSOR GLOW (desktop only) ---- */
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      pointer-events: none;
      width: 320px;
      height: 320px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(59,122,103,0.07) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      z-index: 0;
      transition: opacity 0.3s ease;
      will-change: transform;
    `;
    document.body.appendChild(glow);

    let mouseX = 0, mouseY = 0;
    let glowX  = 0, glowY  = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const glowTick = () => {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      glow.style.left = glowX + 'px';
      glow.style.top  = glowY + 'px';
      requestAnimationFrame(glowTick);
    };
    glowTick();
  }

  /* ---- SCROLL PROGRESS BAR ---- */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  }, { passive: true });

  /* ---- MAGNETIC BUTTONS ---- */
  if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.btn--primary, .btn--outline, .nav__cta').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
        const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---- CARD 3D TILT ON HOVER ---- */
  if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.stat-card, .format-card, .testimonial').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
        const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -8;
        card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ---- BUTTON CLICK RIPPLE ---- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const ripple = document.createElement('span');
      ripple.className = 'btn__ripple';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---- WORD-BY-WORD REVEAL (chapter intro) ---- */
  const wordStagger = document.querySelector('.chapter-intro__quote');
  if (wordStagger) {
    // Remove standard reveal — word system handles animation
    wordStagger.classList.remove('reveal');
    wordStagger.classList.add('revealed');

    // Walk text nodes and wrap each word in a <span class="w">
    const processNode = node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach(part => {
          if (part.trim()) {
            const span = document.createElement('span');
            span.className = 'w';
            span.textContent = part;
            frag.appendChild(span);
          } else {
            frag.appendChild(document.createTextNode(part));
          }
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
        Array.from(node.childNodes).forEach(processNode);
      }
    };
    Array.from(wordStagger.childNodes).forEach(processNode);

    // Animate on scroll
    const wordEls = wordStagger.querySelectorAll('.w');
    const wordObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          wordEls.forEach((w, i) => {
            setTimeout(() => w.classList.add('visible'), i * 55);
          });
          wordObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    wordObs.observe(wordStagger);
  }

  /* ---- HERO WORD SWAP (typewriter) ---- */
  const wordSwapEl = document.getElementById('hero-word-swap');
  const cursorEl   = document.getElementById('typing-cursor');

  if (wordSwapEl) {

    const words = [
      { text: 'lost.',               sad: true  },  // initial word already in HTML
      { text: 'spaceless.',          sad: true  },
      { text: 'anxious.',            sad: true  },
      { text: 'searching.',          sad: true  },
      { text: 'overwhelmed.',        sad: true  },
      { text: 'without a place.',    sad: true  },
      { text: 'burned out.',         sad: true  },
      { text: 'distracted.',         sad: true  },
      { text: 'learning.',           sad: false },
      { text: 'growing.',            sad: false },
      { text: 'discovering.',        sad: false },
      { text: 'finding their way.',  sad: false },
      { text: 'resilient.',          sad: false },
      { text: 'present.',            sad: false },
      { text: 'ready,',               sad: false, final: true },
    ];

    let idx  = 0;
    let step = -1;  // incremented to 0 on first runCycle call
    const sleep = ms => new Promise(r => setTimeout(r, ms));

    // ── Exponential speed decay — gentle start, steep ramp from word 3 ──
    const DECAY      = 0.82;   // gentle decay for first two words
    const DECAY_FAST = 0.75;   // steeper decay from word 3 onward
    const DEL_BASE   = 35;     // ms per character erased at step 0
    const TYP_BASE   = 45;     // ms per character typed at step 0
    const HOLD_BASE  = 540;    // ms hold after word lands at step 0
    const FINAL_TYPE = 90;     // slower typing for "ready." — deliberate impact

    // ── Colour + cursor state per word ──
    const applyStyle = (word) => {
      if (word.final) {
        wordSwapEl.style.color = '';
        wordSwapEl.classList.add('word-swap--final');
        if (cursorEl) {
          cursorEl.classList.remove('typing', 'positive');
          cursorEl.classList.add('final');
        }
      } else if (word.sad) {
        wordSwapEl.style.color = 'var(--text-secondary)';
        wordSwapEl.classList.remove('word-swap--final');
        if (cursorEl) cursorEl.classList.remove('positive', 'final');
      } else {
        wordSwapEl.style.color = 'var(--amber)';
        wordSwapEl.classList.remove('word-swap--final');
        if (cursorEl) {
          cursorEl.classList.remove('final');
          cursorEl.classList.add('positive');
        }
      }
    };

    // Set initial state — "lost." is already in the HTML
    applyStyle(words[0]);

    const runCycle = async () => {
      step++;
      const mult     = step <= 1
        ? Math.pow(DECAY, step)
        : Math.pow(DECAY, 1) * Math.pow(DECAY_FAST, step - 1);
      const deleteMs = Math.max(8,  Math.round(DEL_BASE  * mult));
      const typeMs   = Math.max(10, Math.round(TYP_BASE  * mult));
      const holdMs   = Math.max(50, Math.round(HOLD_BASE * mult));

      // ── ERASE current word, right to left ──
      if (cursorEl) cursorEl.classList.add('typing'); // cursor solid = backspacing
      let text = wordSwapEl.textContent;
      while (text.length > 0) {
        text = text.slice(0, -1);
        wordSwapEl.textContent = text;
        await sleep(deleteMs);
      }

      // ── ADVANCE to next word ──
      idx = (idx + 1) % words.length;
      const next = words[idx];
      applyStyle(next); // colour shifts before first char appears

      // ── TYPE next word, left to right ──
      let typed = '';
      for (const char of next.text) {
        typed += char;
        wordSwapEl.textContent = typed;
        await sleep(next.final ? FINAL_TYPE : typeMs);
      }

      // Done typing — resume cursor blink
      if (cursorEl && !next.final) cursorEl.classList.remove('typing');

      if (!next.final) {
        await sleep(holdMs);
        runCycle();
      } else {
        // "ready." — cursor keeps glowing, then reveal " for a change."
        const tagline = document.getElementById('hero-tagline');
        if (tagline) {
          setTimeout(() => {
            tagline.removeAttribute('aria-hidden');
            tagline.style.display = 'inline';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                tagline.classList.add('hero-tagline--visible');
              });
            });
          }, 900);
        }
      }
    };

    // Start once hero entrance animations settle
    setTimeout(runCycle, 1200);
  }

  /* ── Global sketch underline draw-on observer ── */
  const sketchSvgs = document.querySelectorAll('.sketch-svg');
  if (sketchSvgs.length) {
    const sketchObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.sketch-path').forEach(p => p.classList.add('drawn'));
          sketchObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    sketchSvgs.forEach(el => {
      // Hero-load sketches use a setTimeout instead of observer
      if (!el.classList.contains('sketch-hero-load')) {
        sketchObs.observe(el);
      }
    });
  }


  /* ---- PROMO VIDEO PLAYER (film.html) — YouTube ---- */
  const promoSound = document.getElementById('promoSound');

  if (document.getElementById('film-player')) {
    let filmPlayer;
    let filmMuted = true;

    window.onYouTubeIframeAPIReady = function () {
      filmPlayer = new YT.Player('film-player', {
        events: {
          onReady: function () {
            filmPlayer.mute();

            // Auto-play/pause on scroll
            const promoPlayer = document.getElementById('promoPlayer');
            const filmObs = new IntersectionObserver((entries) => {
              entries.forEach(e => {
                if (e.isIntersecting) {
                  filmPlayer.playVideo();
                } else {
                  filmPlayer.pauseVideo();
                }
              });
            }, { threshold: 0.4 });
            filmObs.observe(promoPlayer);
          }
        }
      });
    };

    // Sound toggle
    if (promoSound) {
      promoSound.addEventListener('click', () => {
        filmMuted = !filmMuted;
        if (filmMuted) {
          filmPlayer.mute();
        } else {
          filmPlayer.unMute();
        }
        promoSound.classList.toggle('is-unmuted', !filmMuted);
        promoSound.setAttribute('aria-label', filmMuted ? 'Unmute video' : 'Mute video');
      });
    }

    // Load YouTube IFrame API
    const ytScript = document.createElement('script');
    ytScript.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(ytScript);
  }

  /* ---- YOUTUBE VIDEO PREVIEW ---- */
  const previewWrap = document.querySelector('.video-preview');
  if (previewWrap && document.getElementById('speaking-player')) {
    const stopTime    = parseInt(previewWrap.dataset.stopTime, 10) || 90;
    const videoId     = previewWrap.dataset.videoId || '';
    const overlay     = previewWrap.querySelector('.video-preview__overlay');
    const progressFill = previewWrap.querySelector('.video-preview__progress-fill');
    const watchFullBtn = previewWrap.querySelector('.js-watch-full');

    // Point "Watch Full Video" to the YouTube page
    if (watchFullBtn && videoId) {
      watchFullBtn.href = 'https://www.youtube.com/watch?v=' + videoId;
    }

    let player;
    let pollInterval = null;
    let previewEnded = false;

    // Define callback BEFORE injecting the script tag to avoid race condition
    window.onYouTubeIframeAPIReady = function () {
      // Attach to the existing iframe — no replacement, no sizing issues
      player = new YT.Player('speaking-player', {
        events: {
          onStateChange: function (e) {
            if (e.data === YT.PlayerState.PLAYING) {
              // Start polling playback position
              pollInterval = setInterval(function () {
                const current = player.getCurrentTime();

                // Update progress bar
                if (progressFill) {
                  const pct = Math.min((current / stopTime) * 100, 100);
                  progressFill.style.width = pct + '%';
                }

                // Stop at preview limit
                if (current >= stopTime && !previewEnded) {
                  previewEnded = true;
                  clearInterval(pollInterval);
                  player.pauseVideo();
                  if (overlay) overlay.classList.add('active');
                }
              }, 250);
            } else {
              clearInterval(pollInterval);
            }
          }
        }
      });

      // Auto-play when scrolled into view, pause when scrolled past
      const speakingObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (previewEnded) return;
          if (e.isIntersecting) {
            player.playVideo();
          } else {
            player.pauseVideo();
          }
        });
      }, { threshold: 0.4 });
      speakingObs.observe(previewWrap);
    };

    // Load the YouTube IFrame API after callback is defined
    const ytScript = document.createElement('script');
    ytScript.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(ytScript);
  }

})();
