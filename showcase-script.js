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

  /* ---- BOOKING FORM — HubSpot API submission ---- */
  const bookingForm = document.querySelector('.booking-form');
  if (bookingForm) {
    const reasonSelect = bookingForm.querySelector('#bf-reason');
    const otherGroup   = bookingForm.querySelector('#bf-other-group');

    // Show/hide "Other" text area based on dropdown selection
    if (reasonSelect) {
      reasonSelect.addEventListener('change', () => {
        otherGroup.style.display = reasonSelect.value === 'Other' ? '' : 'none';
      });
    }

    // Prefill from the speaking-page outline builder, if the visitor came from there.
    try {
      const raw = sessionStorage.getItem('kizzuna_outline');
      if (raw) {
        const data = JSON.parse(raw);
        if (reasonSelect && data.reason) reasonSelect.value = data.reason;
        const otherField = bookingForm.querySelector('#bf-other');
        if (otherField && data.message) {
          otherField.value = data.message;
          if (otherGroup) otherGroup.style.display = ''; // reveal it even though reason isn't "Other"
          const lbl = bookingForm.querySelector('label[for="bf-other"]');
          if (lbl) lbl.textContent = 'What we’d tailor for you';
        }
        sessionStorage.removeItem('kizzuna_outline'); // one-time prefill
      }
    } catch (e) { /* malformed or unavailable storage — leave the form blank */ }

    bookingForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn    = bookingForm.querySelector('#bf-submit');
      const errBox = bookingForm.querySelector('#bf-error');
      const name   = bookingForm.querySelector('#bf-name').value.trim();
      const email  = bookingForm.querySelector('#bf-email').value.trim();
      const reason = bookingForm.querySelector('#bf-reason').value;
      const other  = bookingForm.querySelector('#bf-other').value.trim();
      // Append any detail text (from "Other" or an outline prefill) to the reason.
      const message = other ? `${reason}\n\n${other}` : reason;

      btn.textContent = 'Sending\u2026';
      btn.disabled    = true;
      if (errBox) errBox.style.display = 'none';

      try {
        const res = await fetch(
          'https://api.hsforms.com/submissions/v3/integration/submit/245765726/a2519837-acb9-4b78-a247-5284d05b4d17',
          {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fields: [
                { objectTypeId: '0-1', name: 'firstname', value: name    },
                { objectTypeId: '0-1', name: 'email',     value: email   },
                { objectTypeId: '0-1', name: 'message',   value: message },
              ],
              context: {
                pageUri:  window.location.href,
                pageName: document.title,
              },
            }),
          }
        );

        if (!res.ok) throw new Error(res.status);

        btn.textContent   = '\u2713 Sent \u2014 we\'ll be in touch soon.';
        btn.style.opacity = '0.75';
        bookingForm.reset();
        if (otherGroup) otherGroup.style.display = 'none';
        setTimeout(() => {
          btn.textContent   = 'Send Message';
          btn.disabled      = false;
          btn.style.opacity = '';
        }, 6000);

      } catch {
        btn.textContent = 'Send Message';
        btn.disabled    = false;
        if (errBox) errBox.style.display = '';
      }
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


/* ============================================================
   TOPIC WHEEL — click a topic to open a centered popup, then
   step through every topic with the ‹ › arrows.
   Pure presentation: no state is saved, matching the static site.
   ============================================================ */
(function () {
  const modal = document.querySelector('.topic-modal');
  const allNodes = [...document.querySelectorAll('.topic-node')];
  if (!modal || !allNodes.length) return;

  // Reading order: the three core topics first, then the six options.
  const core = allNodes.filter(n => n.classList.contains('topic-node--core'));
  const pick = allNodes.filter(n => !n.classList.contains('topic-node--core'));
  const order = [...core, ...pick];

  const eyebrowEl = modal.querySelector('.topic-modal__eyebrow');
  const titleEl = modal.querySelector('.topic-modal__title');
  const questionEl = modal.querySelector('.topic-modal__question');
  const bulletsEl = modal.querySelector('.topic-modal__bullets');
  const counterEl = modal.querySelector('.topic-modal__counter');
  const closeBtn = modal.querySelector('.topic-modal__close');

  let index = 0;
  let lastFocused = null; // so we can restore focus to the node that opened the popup

  // Bullets can be a plain string, or {text, sub:[...]} for one level of
  // nested detail (e.g. a headline feature with its specific sub-points).
  function renderBullets(list) {
    bulletsEl.innerHTML = '';
    list.forEach(item => {
      const li = document.createElement('li');
      const sub = typeof item === 'string' ? null : item.sub;
      li.textContent = typeof item === 'string' ? item : item.text;
      if (sub && sub.length) {
        const subUl = document.createElement('ul');
        sub.forEach(s => {
          const subLi = document.createElement('li');
          subLi.textContent = s;
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);
      }
      bulletsEl.appendChild(li);
    });
  }

  function render() {
    const node = order[index];
    eyebrowEl.textContent = node.classList.contains('topic-node--core')
      ? 'Always taught' : 'Choose for your campus';
    titleEl.textContent = node.dataset.title;
    questionEl.textContent = node.dataset.question;
    renderBullets(JSON.parse(node.dataset.bullets || '[]'));
    counterEl.textContent = (index + 1) + ' of ' + order.length;
    allNodes.forEach(n => n.classList.remove('is-active'));
    node.classList.add('is-active');
  }

  function openAt(i) {
    index = (i + order.length) % order.length;
    lastFocused = document.activeElement;
    render();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    // next frame so the CSS transition runs
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden'; // stop the page scrolling behind the popup
    closeBtn.focus();
  }

  function step(dir) {
    index = (index + dir + order.length) % order.length;
    render();
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    allNodes.forEach(n => n.classList.remove('is-active'));
    // wait for the fade-out before hiding, so it animates out
    setTimeout(() => { modal.hidden = true; }, 300);
    if (lastFocused) lastFocused.focus();
  }

  // Open when a topic node is clicked
  order.forEach((node, i) => node.addEventListener('click', () => openAt(i)));

  // Prev / next arrows
  modal.querySelectorAll('[data-topic-dir]').forEach(btn => {
    btn.addEventListener('click', () => step(parseInt(btn.dataset.topicDir, 10)));
  });

  // Close via ✕ or backdrop
  modal.querySelectorAll('[data-topic-close]').forEach(el => {
    el.addEventListener('click', close);
  });

  // Keyboard: Esc closes, arrows step, Tab is trapped inside the card
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowRight') { step(1); return; }
    if (e.key === 'ArrowLeft') { step(-1); return; }
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll('button');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });
})();


/* ============================================================
   BUILD YOUR ENGAGEMENT — outline builder
   Admins pick up to 3 pressing issues; we assemble a tailored
   outline and (on CTA) carry their picks into the contact form.
   All copy lives here so it's edited in one place.
   ============================================================ */
(function () {
  const pillsWrap = document.querySelector('[data-builder-pills]');
  const outlineEl = document.querySelector('[data-builder-outline]');
  const goBtn     = document.querySelector('[data-builder-go]');
  const countEl   = document.querySelector('[data-builder-count]');
  const schoolIn  = document.getElementById('builder-school');
  if (!pillsWrap || !outlineEl || !goBtn) return;

  const MAX = 3;

  // Single source of truth for every issue. `heavy` marks emotionally
  // weighty topics — 2+ of them tips the recommended format to Film + Talk.
  const ISSUES = [
    { id: 'focus', label: 'Phones in class, can’t focus', heavy: false,
      explore: 'Why focus feels impossible now — the apps are built to fracture attention — and how to take it back, instead of treating it as a character flaw.',
      take: 'See focus as trainable, with concrete ways to protect it.',
      tie: 'Attention Activism · Addictive Design' },
    { id: 'anxiety', label: 'Anxiety & depression on the rise', heavy: true,
      explore: 'The mental-health weight our generation carries, named plainly and without dramatizing it — and where so much of it comes from.',
      take: 'Feel seen rather than diagnosed, with language for what they’re feeling.',
      tie: 'Our Generation’s Mental Health' },
    { id: 'lonely', label: 'Loneliness & thin friendships', heavy: true,
      explore: 'Why so many kids feel alone in a hyper-connected world — and what a screen can’t replace about being in a room with people.',
      take: 'A renewed pull toward real, in-person friendship.',
      tie: 'Human Connection' },
    { id: 'compare', label: 'Comparison & self-worth', heavy: true,
      explore: 'The comparison machine: why every feed is a highlight reel, and who profits when kids feel not-enough.',
      take: 'A little more free from the scoreboard, and warier of the feed.',
      tie: 'The Attention Economy · Mental Health' },
    { id: 'addiction', label: 'Screen addiction — can’t put it down', heavy: false,
      explore: 'We open up about our own addiction to Vine, Instagram, and Snapchat, then pull back the curtain on the design tricks that made stopping so hard.',
      take: 'Stop blaming their willpower and start seeing the system.',
      tie: 'Addictive Design · Our Story' },
    { id: 'bully', label: 'Cyberbullying & online cruelty', heavy: true,
      explore: 'How people treat each other when no face is in the room — and what it costs all of us.',
      take: 'A more human default online, and less alone if they’ve been hurt.',
      tie: 'Human Connection · Mental Health' },
    { id: 'ai', label: 'AI — cheating, chatbots, AI “friends”', heavy: false,
      explore: 'Growing up alongside AI — homework, chatbots, even AI companions — the real promise and the quiet costs.',
      take: 'More intentional about where AI helps and where it hollows things out.',
      tie: 'AI & Mental Health' },
    { id: 'sleep', label: 'Sleep loss & burnout', heavy: false,
      explore: 'The real math of an always-on life — the hours, the sleep, the years — and what that time could be instead.',
      take: 'A gut sense of the trade, and small ways to win back the night.',
      tie: 'A Life Online · Mindfulness' },
    { id: 'skills', label: 'Fading in-person social skills', heavy: false,
      explore: 'Why face-to-face feels harder for this generation, and how presence is a muscle you can rebuild.',
      take: 'More courage to be awkward, present, and real.',
      tie: 'Human Connection · Mindfulness' },
    { id: 'doom', label: 'Doomscrolling & always-on anxiety', heavy: false,
      explore: 'Naming the always-on dread — the endless scroll of bad news and notifications — and practicing coming back to the present.',
      take: 'Simple, repeatable ways to put the phone down and breathe.',
      tie: 'The Attention Economy · Mindfulness' }
  ];

  // Fixed bookends — every outline opens and closes the same way.
  const OPENER = {
    title: 'We open with our story',
    text: 'Before any research or advice, we tell the truth about our own years lost to Vine, Instagram, and Snapchat — so the room knows we’re peers who’ve lived it, not adults lecturing down.'
  };
  const CLOSER = {
    title: 'We close with attention activism',
    text: 'Not a list of rules — an invitation to take back agency over where their time and attention go, and a challenge to spend the life in front of them on what actually matters.'
  };

  let selected = []; // ids, capped at MAX

  // Escape user-supplied text (the school name) before it touches innerHTML.
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ---- Render the pills ----
  ISSUES.forEach(issue => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'builder-pill';
    b.textContent = issue.label;
    b.dataset.id = issue.id;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => toggle(issue.id));
    pillsWrap.appendChild(b);
  });

  function toggle(id) {
    const i = selected.indexOf(id);
    if (i > -1) {
      selected.splice(i, 1);
    } else if (selected.length < MAX) {
      selected.push(id);
    } else {
      return; // already at 3 — ignore extra picks
    }
    syncPills();
  }

  function syncPills() {
    pillsWrap.querySelectorAll('.builder-pill').forEach(b => {
      const on = selected.includes(b.dataset.id);
      b.classList.toggle('is-selected', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      // Once 3 are chosen, grey out the rest so the limit is obvious.
      b.disabled = !on && selected.length >= MAX;
    });
    countEl.textContent = selected.length + ' / ' + MAX + ' selected';
    goBtn.disabled = selected.length === 0;
  }

  // ---- Build the outline ----
  function chosenIssues() {
    // Keep master order for a coherent emotional arc, not click order.
    return ISSUES.filter(i => selected.includes(i.id));
  }

  function recommendFormat(chosen) {
    const heavy = chosen.filter(i => i.heavy).length;
    return heavy >= 2
      ? { name: 'Film + Talk Combo', dur: '2–2.5 hrs',
          note: 'The film does the emotional groundwork first, then we open the room for a live conversation — the right fit when the weightiest issues are on the table.' }
      : { name: 'The Core Talk', dur: '45–60 min',
          note: 'Our signature event — personal story, key research, audience interaction, and a live close.' };
  }

  function buildOutline() {
    const chosen = chosenIssues();
    if (!chosen.length) return;
    const school = schoolIn && schoolIn.value.trim();
    const who = school ? esc(school) : 'your students';
    const fmt = recommendFormat(chosen);

    const steps = chosen.map(i => `
      <li class="outline__step">
        <p class="outline__step-title">${esc(i.label)}</p>
        <p class="outline__step-text">${i.explore}
          <span class="outline__step-take">Students leave: ${i.take}</span>
        </p>
        <span class="outline__step-tie">Draws on: ${i.tie}</span>
      </li>`).join('');

    const outcomes = chosen.map(i => `<li>${i.take}</li>`).join('');

    outlineEl.innerHTML = `
      <p class="outline__eyebrow label">Your tailored engagement</p>
      <h2 class="outline__title">For <span>${who}</span>, here’s how we’d shape it.</h2>

      <div class="outline__format">
        <span class="outline__format-label">Recommended format</span>
        <span class="outline__format-name">${fmt.name}</span>
        <span class="outline__format-dur">${fmt.dur}</span>
        <span class="outline__format-note">${fmt.note}</span>
      </div>

      <p class="outline__section-label">The session arc</p>
      <ul class="outline__arc">
        <li class="outline__step outline__step--fixed">
          <p class="outline__step-title">${OPENER.title}</p>
          <p class="outline__step-text">${OPENER.text}</p>
        </li>
        ${steps}
        <li class="outline__step outline__step--fixed">
          <p class="outline__step-title">${CLOSER.title}</p>
          <p class="outline__step-text">${CLOSER.text}</p>
        </li>
      </ul>

      <p class="outline__section-label">What changes</p>
      <ul class="outline__outcomes">${outcomes}</ul>

      <div class="outline__cta">
        <button type="button" class="btn btn--primary" data-outline-start>
          Start this conversation
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="btn__arrow"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <button type="button" class="btn btn--outline" data-outline-print>Print / Save as PDF</button>
      </div>`;

    outlineEl.hidden = false;
    outlineEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Wire the freshly-rendered CTA buttons.
    outlineEl.querySelector('[data-outline-start]').addEventListener('click', () => startConversation(chosen, school, fmt));
    outlineEl.querySelector('[data-outline-print]').addEventListener('click', () => window.print());
  }

  // Stash the outline summary and hand off to the contact form.
  function startConversation(chosen, school, fmt) {
    const issuesText = chosen.map(i => i.label).join(', ');
    const message =
      (school ? 'School: ' + school + '\n\n' : '') +
      'We’d love to explore a Kizzuna engagement for our campus.\n\n' +
      'The issues weighing most on our students: ' + issuesText + '.\n\n' +
      'Suggested format from your site: ' + fmt.name + ' (' + fmt.dur + ').';
    try {
      sessionStorage.setItem('kizzuna_outline', JSON.stringify({
        reason: 'Book School Presentation',
        message: message,
        school: school || ''
      }));
    } catch (e) { /* private mode / storage disabled — the form still works, just unfilled */ }
    window.location.href = 'book.html#inquiry-form';
  }

  goBtn.addEventListener('click', buildOutline);
})();
