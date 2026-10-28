/* =========================================================
   给王芊予的生日小书 · 10.28
   No libraries. Everything below is hand-written for this book.
   ========================================================= */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const params = new URLSearchParams(location.search);
  if (params.has('still')) document.documentElement.classList.add('is-still');

  /* ---------------------------------------------------------
     Canvas helpers
     --------------------------------------------------------- */
  function fitCanvas(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.dataset.dpr = String(dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  /* ---------------------------------------------------------
     Ambient rose petals
     --------------------------------------------------------- */
  const petalsCanvas = $('#petals');
  let petalCtx = petalsCanvas ? fitCanvas(petalsCanvas) : null;
  let petals = [];
  let petalRaf = null;

  const petalColors = [
    'rgba(190, 118, 118, .52)',
    'rgba(215, 156, 150, .45)',
    'rgba(230, 197, 174, .55)',
    'rgba(180, 138, 78, .30)'
  ];

  function makePetal(initial = false) {
    const size = 3.6 + Math.random() * 5.4;
    return {
      x: Math.random() * window.innerWidth,
      y: initial ? Math.random() * window.innerHeight : -20 - Math.random() * 80,
      size,
      vy: 0.18 + Math.random() * 0.38,
      drift: 0.25 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.012,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      alpha: 0.38 + Math.random() * 0.35
    };
  }

  function seedPetals() {
    if (!petalCtx) return;
    const count = coarsePointer ? 10 : 17;
    petals = Array.from({ length: count }, () => makePetal(true));
  }

  function drawPetal(p) {
    const ctx = petalCtx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * 0.95, -p.size * 0.4, p.size * 0.78, p.size * 0.72, 0, p.size);
    ctx.bezierCurveTo(-p.size * 0.78, p.size * 0.72, -p.size * 0.95, -p.size * 0.4, 0, -p.size);
    ctx.fill();
    ctx.restore();
  }

  function petalLoop() {
    if (!petalCtx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    petalCtx.clearRect(0, 0, w, h);
    for (const p of petals) {
      p.phase += 0.008;
      p.y += p.vy;
      p.x += Math.sin(p.phase) * p.drift * 0.32 + 0.05;
      p.angle += p.spin;
      if (p.y > h + 30) {
        const fresh = makePetal(false);
        Object.assign(p, fresh);
      }
      if (p.x > w + 40) p.x = -30;
      if (p.x < -40) p.x = w + 30;
      drawPetal(p);
    }
    petalRaf = requestAnimationFrame(petalLoop);
  }

  function startPetals() {
    if (!petalCtx || reduceMotion) return;
    seedPetals();
    if (!petalRaf) petalLoop();
  }

  function stopPetals() {
    if (petalRaf) cancelAnimationFrame(petalRaf);
    petalRaf = null;
    if (petalCtx) petalCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  if (petalCtx) startPetals();

  /* ---------------------------------------------------------
     Confetti
     --------------------------------------------------------- */
  const confettiCanvas = $('#confetti');
  let confettiCtx = confettiCanvas ? fitCanvas(confettiCanvas) : null;
  let confettiParticles = [];
  let confettiRaf = null;

  const confettiColors = ['#7a2e32', '#c98988', '#e8cdae', '#b48a4e', '#f8f1e6', '#7f8a70'];

  function fireConfetti(originX, originY, count = 130, spread = 1) {
    if (!confettiCtx || reduceMotion) return;
    const x = typeof originX === 'number' ? originX : window.innerWidth / 2;
    const y = typeof originY === 'number' ? originY : window.innerHeight * 0.46;
    for (let i = 0; i < count; i++) {
      const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.05;
      const speed = (3.4 + Math.random() * 8.2) * spread;
      const shape = Math.random() < 0.24 ? 'circle' : (Math.random() < 0.38 ? 'petal' : 'rect');
      confettiParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2.4,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 2.2,
        w: 3 + Math.random() * 7,
        h: 5 + Math.random() * 10,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        shape,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.28,
        gravity: 0.115 + Math.random() * 0.08,
        drag: 0.988 + Math.random() * 0.006,
        life: 1,
        decay: 0.004 + Math.random() * 0.004
      });
    }
    if (!confettiRaf) confettiLoop();
  }

  function drawConfettiPiece(p) {
    const ctx = confettiCtx;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = p.color;
    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.w * 0.48, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === 'petal') {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w * 0.46, p.h * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    ctx.restore();
  }

  function confettiLoop() {
    if (!confettiCtx) { confettiRaf = null; return; }
    const w = window.innerWidth;
    const h = window.innerHeight;
    confettiCtx.clearRect(0, 0, w, h);
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > h + 60 || p.x < -80 || p.x > w + 80) {
        confettiParticles.splice(i, 1);
        continue;
      }
      drawConfettiPiece(p);
    }
    if (confettiParticles.length) {
      confettiRaf = requestAnimationFrame(confettiLoop);
    } else {
      confettiCtx.clearRect(0, 0, w, h);
      confettiRaf = null;
    }
  }

  /* ---------------------------------------------------------
     Sound: a small music-box "Happy Birthday"
     --------------------------------------------------------- */
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const soundToggle = $('#soundToggle');
  const soundLabel = $('#soundLabel');
  const songEl = $('#bgSong');
  const birthdayEl = $('#birthdaySong');
  const musicFallback = $('#musicFallback');
  const storySongSrc = songEl?.getAttribute('src') || 'https://cdn.jsdelivr.net/gh/cshh-bit/birthday-site@v4/assets/music/xiang-feng-yi-yang.m4a';
  const birthdaySongSrc = birthdayEl?.getAttribute('src') || 'https://cdn.jsdelivr.net/gh/cshh-bit/birthday-site@v4/assets/music/sheng-ri-kuai-le.m4a';
  const giftTrigger = $('#giftTrigger');
  const giftWrap = $('#giftWrap');
  let audioCtx = null;
  let master = null;
  let isPlaying = false;
  let songEndTimer = null;
  let usingSong = false;
  let songUnavailable = false;
  let giftActive = false;
  let playRequest = 0;
  let storyMusicPrimed = false;
  let birthdaySongStarted = false;
  let birthdaySongStarting = false;
  let storyMusicTimer = null;
  let storyUnlockTimer = null;
  let fireworkNoiseBuffer = null;

  const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // [midi note, beats] — 0 is a rest
  const melody = [
    [67, 0.5], [67, 0.5], [69, 1], [67, 1], [72, 1], [71, 2],
    [67, 0.5], [67, 0.5], [69, 1], [67, 1], [74, 1], [72, 2],
    [67, 0.5], [67, 0.5], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
    [77, 0.5], [77, 0.5], [76, 1], [72, 1], [74, 1], [72, 2.6],
    [0, 1.2]
  ];

  // Soft bass roots under each phrase
  const bass = [
    [48, 0, 12], [43, 12, 12], [48, 24, 12], [41, 36, 12], [43, 48, 12], [48, 60, 14]
  ];

  function ensureAudio() {
    if (!AudioCtx) return null;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function primeStoryMusic() {
    if (giftActive || isPlaying || !songEl || songUnavailable) return;
    ensureAudio();
    try {
      if (songEl.getAttribute('src') !== storySongSrc) {
        songEl.pause();
        songEl.src = storySongSrc;
        songEl.load();
      }
      // Play the first (near-silent) fraction inside the quiz-submit gesture
      // to unlock audible playback, then pause until the fireworks.
      clearTimeout(storyUnlockTimer);
      songEl.muted = false;
      songEl.volume = 0.8;
      songEl.currentTime = 0;
      storyMusicPrimed = true;
      const promise = songEl.play();
      if (promise && promise.then) {
        promise.then(() => {
          storyUnlockTimer = setTimeout(() => {
            if (storyIntroComplete || songEl.paused) return;
            try { songEl.pause(); } catch (_) {}
            songEl.currentTime = 0;
            songEl.muted = true;
            songEl.volume = 0;
          }, 180);
        }).catch(() => { storyMusicPrimed = false; });
      }
    } catch (error) {
      storyMusicPrimed = false;
    }
  }

  function showMusicFallback() {
    if (musicFallback) musicFallback.hidden = false;
  }

  async function forceStoryMusic() {
    if (!songEl || songUnavailable) {
      playSong();
      return;
    }
    setGiftOpen(false);
    if (birthdayEl && !birthdayEl.paused) {
      try { birthdayEl.pause(); } catch (_) {}
    }
    try { songEl.pause(); } catch (_) {}
    isPlaying = false;
    try {
      songEl.currentTime = 0;
      songEl.muted = false;
      songEl.volume = 0.8;
      await songEl.play();
      usingSong = true;
      isPlaying = true;
      storyMusicPrimed = false;
      if (musicFallback) musicFallback.hidden = true;
      updateSoundUI();
    } catch (error) {
      if (error && error.name === 'NotAllowedError') {
        showMusicFallback();
      } else {
        songUnavailable = true;
        playSong();
      }
    }
  }

  async function startStoryMusic() {
    if (giftActive) return;
    if (isPlaying) {
      if (songEl && songEl.getAttribute('src') === storySongSrc && !songEl.paused && songEl.volume > 0) return;
      stopMusic();
    }
    if (songEl && !songUnavailable) {
      try {
        if (songEl.getAttribute('src') !== storySongSrc) {
          songEl.pause();
          songEl.src = storySongSrc;
          songEl.load();
        }
        songEl.muted = false;
        songEl.currentTime = 0;
        songEl.volume = 0.8;
        await songEl.play();
        if (songEl.paused) {
          showMusicFallback();
          return;
        }
        usingSong = true;
        isPlaying = true;
        if (musicFallback) musicFallback.hidden = true;
        updateSoundUI();
        return;
      } catch (error) {
        if (error && error.name === 'NotAllowedError') {
          showMusicFallback();
          return;
        }
        songUnavailable = true;
      }
    }
    playSong();
  }

  function updateSoundUI() {
    if (!soundToggle) return;
    soundToggle.classList.toggle('is-playing', isPlaying);
    soundToggle.setAttribute('aria-pressed', String(isPlaying));
    soundToggle.setAttribute('aria-label', isPlaying ? '关闭音乐' : '打开声音');
    if (soundLabel) soundLabel.textContent = isPlaying ? 'Sound on' : 'Tap for sound';
  }

  function setGiftOpen(active) {
    const wasActive = giftActive;
    giftActive = active;
    if (!giftWrap || !giftTrigger) return;
    giftWrap.classList.toggle('is-open', active);
    giftTrigger.setAttribute('aria-pressed', String(active));
    giftTrigger.setAttribute('aria-label', active ? '关闭灯球和音乐' : '点击灯球播放音乐');
    if (active && !wasActive) {
      const rect = giftTrigger.getBoundingClientRect();
      setTimeout(() => {
        fireConfetti(rect.left + rect.width / 2, rect.top + rect.height * 0.34, 46, 0.72);
      }, 280);
    }
  }

  async function startMusic() {
    if (isPlaying || giftActive) return;
    // Resume the audio context inside the click gesture, so the fallback
    // music box still works if the mp3 has not been added yet.
    ensureAudio();
    setGiftOpen(true);
    const request = ++playRequest;

    // On the cover the sound control and disco ball must start the birthday
    // song, not the story track.
    if (!document.body.classList.contains('is-inside') && birthdayEl) {
      try {
        birthdayEl.muted = false;
        birthdayEl.volume = 0.8;
        birthdayEl.currentTime = 0;
        await birthdayEl.play();
        if (request !== playRequest || !giftActive) {
          try { birthdayEl.pause(); } catch (_) {}
          return;
        }
        birthdaySongStarted = true;
        usingSong = false;
        isPlaying = true;
        updateSoundUI();
        return;
      } catch (_) {
        if (request !== playRequest || !giftActive) return;
      }
    }

    if (songEl && !songUnavailable) {
      try {
        songEl.muted = false;
        songEl.volume = 0.8;
        if (songEl.readyState > 0) {
          try { songEl.currentTime = 0; } catch (_) {}
        }
        await songEl.play();
        if (request !== playRequest || !giftActive) {
          try { songEl.pause(); } catch (_) {}
          return;
        }
        usingSong = true;
        isPlaying = true;
        updateSoundUI();
        return;
      } catch (_) {
        if (request !== playRequest || !giftActive) return;
        songUnavailable = true;
        usingSong = false;
        try { songEl.pause(); } catch (_) {}
      }
    }

    if (request !== playRequest || !giftActive) return;
    playSong();
  }

  function stopMusic() {
    playRequest++;
    if (songEl && !songEl.paused) {
      try { songEl.pause(); } catch (_) {}
    }
    if (birthdayEl && !birthdayEl.paused) {
      try { birthdayEl.pause(); } catch (_) {}
    }
    usingSong = false;
    stopSong();
    setGiftOpen(false);
  }

  function togglePlayback() {
    if (isPlaying || giftActive) stopMusic();
    else startMusic();
  }

  function scheduleTone(freq, start, duration, type = 'sine', volume = 0.18, harmonic = 0) {
    const ctx = audioCtx;
    if (!ctx || !master || !freq) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.28, duration * 1.45));
    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + Math.max(0.35, duration * 1.5) + 0.05);

    if (harmonic > 0) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, start);
      gain2.gain.setValueAtTime(0.0001, start);
      gain2.gain.linearRampToValueAtTime(volume * harmonic, start + 0.012);
      gain2.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.22, duration * 0.9));
      osc2.connect(gain2).connect(master);
      osc2.start(start);
      osc2.stop(start + Math.max(0.3, duration * 1.1) + 0.05);
    }
  }

  function playSong() {
    const ctx = ensureAudio();
    if (!ctx) return;
    if (isPlaying) stopSong();

    master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.36, ctx.currentTime + 0.35);

    // gentle room echo
    const delay = ctx.createDelay(1.2);
    const feedback = ctx.createGain();
    const wet = ctx.createGain();
    delay.delayTime.value = 0.29;
    feedback.gain.value = 0.16;
    wet.gain.value = 0.13;
    master.connect(ctx.destination);
    master.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(ctx.destination);

    const beat = 0.56;
    const t0 = ctx.currentTime + 0.18;
    let cursor = 0;

    for (const [note, beats] of melody) {
      const dur = beats * beat;
      if (note) {
        scheduleTone(midiToFreq(note), t0 + cursor * beat, dur, 'sine', 0.19, 0.16);
        // a quiet octave sparkle, like a music box
        scheduleTone(midiToFreq(note + 12), t0 + cursor * beat + 0.012, dur * 0.62, 'sine', 0.028, 0);
      }
      cursor += beats;
    }

    for (const [note, startBeat, beats] of bass) {
      scheduleTone(midiToFreq(note), t0 + startBeat * beat, beats * beat, 'sine', 0.055, 0);
    }

    isPlaying = true;
    updateSoundUI();
    const totalMs = (cursor * beat + 1.2) * 1000;
    clearTimeout(songEndTimer);
    songEndTimer = setTimeout(() => {
      if (!isPlaying) return;
      isPlaying = false;
      updateSoundUI();
      setGiftOpen(false);
      if (master) {
        const old = master;
        master = null;
        try { old.disconnect(); } catch (_) {}
      }
    }, totalMs);
  }

  function stopSong() {
    clearTimeout(songEndTimer);
    if (!audioCtx || !master) {
      isPlaying = false;
      updateSoundUI();
      return;
    }
    const old = master;
    const now = audioCtx.currentTime;
    try {
      old.gain.cancelScheduledValues(now);
      old.gain.setValueAtTime(old.gain.value, now);
      old.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    } catch (_) {}
    master = null;
    isPlaying = false;
    updateSoundUI();
    setTimeout(() => {
      try { old.disconnect(); } catch (_) {}
    }, 420);
  }

  songEl?.addEventListener('ended', () => {
    if (!usingSong) return;
    usingSong = false;
    isPlaying = false;
    updateSoundUI();
  });

  birthdayEl?.addEventListener('ended', () => {
    if (usingSong) return;
    isPlaying = false;
    updateSoundUI();
  });

  if (soundToggle) {
    soundToggle.addEventListener('click', togglePlayback);
  }
  if (giftTrigger) {
    giftTrigger.addEventListener('click', togglePlayback);
  }

  async function playBirthdaySong() {
    if (birthdaySongStarted || birthdaySongStarting) return;
    if (giftActive || isPlaying) {
      birthdaySongStarted = true;
      return;
    }
    if (!birthdayEl) {
      birthdaySongStarted = true;
      ensureAudio();
      playSong();
      return;
    }
    birthdaySongStarting = true;
    try {
      birthdayEl.muted = false;
      birthdayEl.volume = 0.8;
      birthdayEl.currentTime = 0;
      await birthdayEl.play();
      birthdaySongStarted = true;
      usingSong = false;
      isPlaying = true;
      updateSoundUI();
    } catch (error) {
      if (error && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
        return;
      }
      birthdaySongStarted = true;
      ensureAudio();
      playSong();
    } finally {
      birthdaySongStarting = false;
    }
  }

  function stopBirthdaySong() {
    if (birthdayEl) {
      try { birthdayEl.pause(); } catch (error) {}
      try { birthdayEl.currentTime = 0; } catch (error) {}
    }
    if (!giftActive && isPlaying) stopMusic();
  }

  musicFallback?.addEventListener('click', async () => {
    if (!songEl) return;
    try {
      if (songEl.getAttribute('src') !== storySongSrc) {
        songEl.pause();
        songEl.src = storySongSrc;
        songEl.load();
      }
      songEl.muted = false;
      songEl.currentTime = 0;
      songEl.volume = 0.8;
      await songEl.play();
      usingSong = true;
      isPlaying = true;
      storyMusicPrimed = false;
      musicFallback.hidden = true;
      updateSoundUI();
    } catch (error) {
      showMusicFallback();
    }
  });

  document.addEventListener('birthday:birthday-song', () => {
    playBirthdaySong();
  });

  document.addEventListener('birthday:stop-birthday-song', () => {
    stopBirthdaySong();
  });

  // Start the birthday song on the cover. Browsers may block sound until the
  // first interaction; in that case the same song begins on the first tap/click.
  window.setTimeout(() => {
    if (!birthdaySongStarted) playBirthdaySong();
  }, 350);

  const startBirthdayOnGesture = (event) => {
    if (birthdaySongStarted) return;
    if (event.target.closest && event.target.closest('#soundToggle, #giftTrigger')) return;
    playBirthdaySong();
  };
  document.addEventListener('pointerdown', startBirthdayOnGesture, true);
  document.addEventListener('click', startBirthdayOnGesture, true);
  document.addEventListener('keydown', startBirthdayOnGesture, true);

  /* ---------------------------------------------------------
     Page turn
     --------------------------------------------------------- */
  const book = $('#book');
  const cover = $('#cover');
  const inside = $('#inside');
  const story = $('#story');
  const turnPage = $('#turnPage');
  const backCover = $('#backCover');
  const brandLink = $('.brand');
  let pageTurnToken = 0;
  let directEntry = false;

  function restartExperience() {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    window.location.replace(url.toString());
  }

  function setPageTurned(turned) {
    if (!book) return;
    if (book.classList.contains('is-turned') === turned) return;
    const token = ++pageTurnToken;

    book.classList.toggle('is-turned', turned);
    body.classList.toggle('is-inside', turned);

    if (turned) startStoryIntro(directEntry);
    else stopStoryIntro();
    directEntry = false;

    if (cover) {
      cover.setAttribute('aria-hidden', String(turned));
      cover.toggleAttribute('inert', turned);
    }
    if (inside) {
      inside.setAttribute('aria-hidden', String(!turned));
      inside.toggleAttribute('inert', !turned);
    }

    setTimeout(() => {
      if (token !== pageTurnToken) return;
      if (turned) (story || inside)?.focus({ preventScroll: true });
      else turnPage?.focus({ preventScroll: true });
    }, 90);
  }

  turnPage?.addEventListener('click', () => setPageTurned(true));
  backCover?.addEventListener('click', () => restartExperience());
  brandLink?.addEventListener('click', (e) => {
    if (!book?.classList.contains('is-turned')) return;
    e.preventDefault();
    restartExperience();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !book?.classList.contains('is-turned')) return;
    e.preventDefault();
    setPageTurned(false);
  });
  document.addEventListener('birthday:story-direct', () => {
    if (!book) return;
    directEntry = true;
    book.classList.add('is-direct');
    setPageTurned(true);
    window.setTimeout(() => book.classList.remove('is-direct'), 1300);
  });


  /* ---------------------------------------------------------
     Countdown + fireworks
     --------------------------------------------------------- */
  const fireworksCanvas = $('#fireworks');
  let fireworksCtx = fireworksCanvas ? fitCanvas(fireworksCanvas) : null;
  const storyCountdown = $('#storyCountdown');
  const storyCountdownNum = $('#storyCountdownNum');
  const storyCountdownLine = $('#storyCountdownLine');
  const storyCountdownHint = document.querySelector('.story-countdown__hint');
  const storyStartBtn = $('#storyStart');
  let storyIntroPlayed = false;
  let storyIntroComplete = false;
  let storyIntroToken = 0;
  let storyIntroTimers = [];
  let introRevealTimer = null;
  let introReadyTimer = null;
  let fireworkParticles = [];
  let fireworkRaf = null;

  function revealIntro(immediate = false) {
    const introScene = document.getElementById('scene1');
    if (!introScene) return;
    introScene.classList.add('is-revealed');
    clearTimeout(introReadyTimer);
    if (immediate) {
      introScene.classList.add('intro-ready');
    } else {
      introReadyTimer = setTimeout(() => introScene.classList.add('intro-ready'), 3300);
    }
  }

  function setCountdownNumber(value) {
    if (!storyCountdownNum) return;
    storyCountdownNum.textContent = String(value);
    storyCountdownNum.classList.remove('is-pop');
    void storyCountdownNum.offsetWidth;
    storyCountdownNum.classList.add('is-pop');
  }

  function startStoryIntro(immediate = false) {
    if (!storyCountdown) return;
    if (storyIntroPlayed) {
      revealIntro(true);
      return;
    }
    if (params.has('still') || reduceMotion) {
      storyIntroPlayed = true;
      storyIntroComplete = true;
      revealIntro(true);
      return;
    }

    storyIntroPlayed = true;
    storyIntroComplete = false;
    const token = ++storyIntroToken;
    storyIntroTimers.forEach((timer) => clearTimeout(timer));
    storyIntroTimers = [];

    storyCountdown.hidden = false;
    storyCountdown.classList.remove('is-leaving', 'show-line');
    if (storyCountdownNum) {
      storyCountdownNum.hidden = true;
      storyCountdownNum.textContent = '';
    }
    if (storyCountdownHint) storyCountdownHint.hidden = true;
    if (storyCountdownLine) storyCountdownLine.hidden = true;
    body.classList.add('countdown-open');
    story?.classList.add('is-locked');

    const beginCountdown = () => {
      if (token !== storyIntroToken) return;
      if (storyStartBtn) storyStartBtn.hidden = true;
      forceStoryMusic();
      if (storyCountdownNum) storyCountdownNum.hidden = false;
      if (storyCountdownHint) storyCountdownHint.hidden = false;

      storyIntroTimers.push(setTimeout(() => {
        if (token !== storyIntroToken) return;
        setCountdownNumber(3);
      }, 0));

      storyIntroTimers.push(setTimeout(() => {
        if (token !== storyIntroToken) return;
        setCountdownNumber(2);
      }, 1000));

      storyIntroTimers.push(setTimeout(() => {
        if (token !== storyIntroToken) return;
        setCountdownNumber(1);
      }, 2000));

      storyIntroTimers.push(setTimeout(() => {
        if (token !== storyIntroToken) return;
        storyIntroComplete = true;
        if (storyCountdownNum) storyCountdownNum.hidden = true;
        if (storyCountdownHint) storyCountdownHint.hidden = true;
        if (storyCountdownLine) {
          storyCountdownLine.hidden = false;
          storyCountdown.classList.add('show-line');
        }
        storyIntroTimers.push(setTimeout(() => {
          if (token !== storyIntroToken) return;
          storyCountdown.classList.add('is-leaving');
          body.classList.remove('countdown-open');
          startFireworks();
          clearTimeout(introRevealTimer);
          introRevealTimer = setTimeout(revealIntro, 2600);
          setTimeout(() => {
            if (token !== storyIntroToken) return;
            storyCountdown.hidden = true;
            storyCountdown.classList.remove('is-leaving', 'show-line');
            story?.classList.remove('is-locked');
          }, 680);
        }, 3000));
      }, 3000));
    };

    if (storyStartBtn) {
      storyStartBtn.hidden = false;
      storyStartBtn.onclick = beginCountdown;
    } else {
      beginCountdown();
    }
  }

  function stopStoryIntro() {
    if (!storyCountdown) return;
    storyIntroToken += 1;
    storyIntroTimers.forEach((timer) => clearTimeout(timer));
    storyIntroTimers = [];
    storyCountdown.hidden = true;
    storyCountdown.classList.remove('is-leaving', 'show-line');
    if (storyStartBtn) {
      storyStartBtn.hidden = true;
      storyStartBtn.onclick = null;
    }
    if (storyCountdownNum) storyCountdownNum.hidden = false;
    if (storyCountdownHint) storyCountdownHint.hidden = false;
    if (storyCountdownLine) storyCountdownLine.hidden = true;
    body.classList.remove('countdown-open');
    story?.classList.remove('is-locked');
    clearTimeout(introRevealTimer);
    clearTimeout(introReadyTimer);
    clearTimeout(storyMusicTimer);
    clearTimeout(storyUnlockTimer);
    introRevealTimer = null;
    introReadyTimer = null;
    storyMusicTimer = null;
    if (musicFallback) musicFallback.hidden = true;
    if (!giftActive && songEl && !songEl.paused) {
      try { songEl.pause(); } catch (error) {}
      songEl.currentTime = 0;
      storyMusicPrimed = false;
      usingSong = false;
      isPlaying = false;
      updateSoundUI();
    }
    if (!storyIntroComplete) storyIntroPlayed = false;
    stopFireworks();
  }

  function playFireworkBurstSound() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (!fireworkNoiseBuffer) {
      const length = Math.floor(ctx.sampleRate * 0.8);
      fireworkNoiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = fireworkNoiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = fireworkNoiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1300, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.55);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.72);

    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(74, now);
    boom.frequency.exponentialRampToValueAtTime(38, now + 0.3);
    boomGain.gain.setValueAtTime(0.0001, now);
    boomGain.gain.exponentialRampToValueAtTime(0.16, now + 0.015);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    boom.connect(boomGain).connect(ctx.destination);
    boom.start(now);
    boom.stop(now + 0.6);
  }

  function fireworkBurst(x, y, colorIndex) {
    if (!fireworksCtx) return;
    const colors = [[255,215,106], [255,239,179], [201,137,136], [211,226,255]];
    const color = colors[colorIndex % colors.length];
    const count = 78;
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.7 + Math.random() * 5.4;
      fireworkParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.010 + Math.random() * 0.009,
        size: 1.1 + Math.random() * 1.6,
        color
      });
    }
    if (!fireworkRaf) fireworkLoop();
  }

  function fireworkLoop() {
    if (!fireworksCtx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    fireworksCtx.clearRect(0, 0, w, h);
    fireworksCtx.globalCompositeOperation = 'lighter';

    for (let index = fireworkParticles.length - 1; index >= 0; index -= 1) {
      const particle = fireworkParticles[index];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.986;
      particle.vy = particle.vy * 0.986 + 0.055;
      particle.life -= particle.decay;

      if (particle.life <= 0 || particle.y > h + 40) {
        fireworkParticles.splice(index, 1);
        continue;
      }

      const [r, g, b] = particle.color;
      fireworksCtx.globalAlpha = Math.max(0, particle.life);
      fireworksCtx.strokeStyle = `rgb(${r},${g},${b})`;
      fireworksCtx.lineWidth = particle.size;
      fireworksCtx.beginPath();
      fireworksCtx.moveTo(particle.x - particle.vx * 3.4, particle.y - particle.vy * 3.4);
      fireworksCtx.lineTo(particle.x, particle.y);
      fireworksCtx.stroke();
    }

    fireworksCtx.globalAlpha = 1;
    if (fireworkParticles.length) {
      fireworkRaf = requestAnimationFrame(fireworkLoop);
    } else {
      fireworkRaf = null;
      fireworksCtx.clearRect(0, 0, w, h);
    }
  }

  function startFireworks() {
    if (!fireworksCanvas || reduceMotion) return;
    fireworksCtx = fitCanvas(fireworksCanvas);
    fireworkParticles = [];
    const bursts = [
      [0.50, 0.20, 0],
      [0.28, 0.30, 280],
      [0.73, 0.27, 560],
      [0.42, 0.16, 980],
      [0.62, 0.38, 1420],
      [0.34, 0.42, 1850]
    ];
    bursts.forEach(([x, y, delay], index) => {
      setTimeout(() => {
        if (!book?.classList.contains('is-turned')) return;
        fireworkBurst(window.innerWidth * x, window.innerHeight * y, index);
      }, delay);
    });
    clearTimeout(storyMusicTimer);
    storyMusicTimer = null;
    startStoryMusic();
  }

  function stopFireworks() {
    if (fireworkRaf) cancelAnimationFrame(fireworkRaf);
    fireworkRaf = null;
    fireworkParticles = [];
    if (fireworksCtx) {
      fireworksCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  /* ---------------------------------------------------------
     Story scenes
     --------------------------------------------------------- */
  const scenes = $$('.story-scene');
  const finalType = $('#finalType');
  const finalTypeText = '再说一遍，王芊予，生日快乐';
  let finalTypePlayed = false;
  let finalTypeTimer = null;

  function typeFinalLine() {
    if (!finalType || finalTypePlayed) return;
    finalTypePlayed = true;
    finalType.textContent = '';
    finalType.classList.remove('is-done');
    if (reduceMotion) {
      finalType.textContent = finalTypeText;
      finalType.classList.add('is-done');
      return;
    }
    let index = 0;
    const tick = () => {
      index += 1;
      finalType.textContent = finalTypeText.slice(0, index);
      if (index < finalTypeText.length) {
        finalTypeTimer = setTimeout(tick, 135);
      } else {
        finalType.classList.add('is-done');
      }
    };
    tick();
  }
  const storyProgress = $('#storyProgress');
  const storyDots = [];
  let currentScene = 0;

  if (storyProgress) {
    scenes.forEach((_, index) => {
      const dot = document.createElement('i');
      if (index === 0) dot.classList.add('is-active');
      storyProgress.appendChild(dot);
      storyDots.push(dot);
    });
  }

  function setStoryProgress(index) {
    storyDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  }

  function scrollToScene(id) {
    const target = document.getElementById(id);
    if (!story || !target) return;
    const top = target.getBoundingClientRect().top - story.getBoundingClientRect().top + story.scrollTop;
    story.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  $$('[data-next]').forEach((button) => {
    button.addEventListener('click', () => scrollToScene(button.dataset.next));
  });

  if (scenes.length) {
    scenes[0].classList.add('is-active');
    setStoryProgress(0);

    if (story && 'IntersectionObserver' in window) {
      const sceneObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-active');
          if (entry.target.id === 'scene10' && entry.intersectionRatio >= 0.45) {
            typeFinalLine();
          }
          if (entry.intersectionRatio >= 0.45) {
            const index = scenes.indexOf(entry.target);
            if (index >= 0) {
              currentScene = index;
              setStoryProgress(index);
            }
          }
        });
      }, { root: story, threshold: [0.2, 0.5, 0.8] });
      scenes.forEach((scene) => sceneObserver.observe(scene));
    }
  }

  /* ---------------------------------------------------------
     21 star messages
     --------------------------------------------------------- */
  const starField = $('#starField');
  const starNote = $('#starNote');
  const starNoteCount = $('#starNoteCount');
  const starNoteText = $('#starNoteText');
  const starNoteTitle = $('#starNoteTitle');
  const starNoteImage = $('#starNoteImage');
  const starNoteStage = $('#starNoteStage');
  const starFlip = $('#starFlip');
  const starFront = $('#starFront');
  const starBack = $('#starBack');
  const starNoteFrontCount = $('#starNoteFrontCount');
  const closeStarNoteButton = $('#closeStarNote');
  const closeStarNoteText = $('#closeStarNoteText');
  const starReadCount = $('#starReadCount');
  const starComplete = $('#starComplete');
  const starMessages = [
    '这好像是最早的合照吧',
    '哼哼，我是监工，督促你认真干活',
    '第一次一起坐飞机就让我抓住机会了，还记得是去哪吗',
    '好姐妹是一生知己，心有灵犀快乐有默契〰️',
    '狗！',
    '第一段真正的旅行哦哦哦哦',
    '在海南岛跟诡秘当鸭嘴兽的日子',
    '跟诡秘在南海洗脚的日子',
    '有第一次就有第二次',
    '哼哼让你拿我手机偷拍',
    '记录小居居聚精会神的样子',
    '你就说这张是不是神图吧',
    '和小居居在钟楼打卡 哼哼',
    '和小居居吃铜锅涮肉的日子，啧，大半夜看香死我了',
    '两只居深情对望，也没有对望吧，还有你是小居居，我不是',
    '和诡秘游完泳当猴子的日子',
    '哦，忘了这个，好喝好喝',
    '和小居居开学出逃的日子',
    '小居居！我现在好想再坐到黄河边上吹风看别人玩羊皮筏子……',
    '想吃，你想吃不小居居（勾引',
    '和诡秘同甘共苦的日子ing'
  ];
  const starPositions = [
    [8,20],[20,10],[34,18],[48,9],[62,17],[76,10],[90,20],
    [12,42],[26,35],[41,39],[56,32],[70,41],[84,35],[93,50],
    [16,66],[31,58],[45,65],[59,56],[73,66],[87,60],[58,82]
  ];
  const starPhotos = Array.from({ length: 21 }, (_, index) =>
    `https://cdn.jsdelivr.net/gh/cshh-bit/birthday-site@v4/assets/photos/star-messages/${String(index + 1).padStart(2, '0')}.jpg`
  );
  const readStars = new Set();
  let lastStarButton = null;
  let starFocusAfterClose = null;

  function updateStarProgress() {
    if (starReadCount) starReadCount.textContent = `已读 ${readStars.size} / ${starPositions.length}`;
    if (starComplete) starComplete.hidden = readStars.size !== starPositions.length;
  }

  function sizeStarNoteCard() {
    if (!starNoteStage || !starNoteImage?.naturalWidth || !starNoteImage.naturalHeight) return;
    const maxW = Math.min(window.innerWidth * 0.86, 640);
    const maxH = Math.min(window.innerHeight * 0.72, 760);
    const ratio = starNoteImage.naturalWidth / starNoteImage.naturalHeight;
    let width = Math.min(maxW, maxH * ratio);
    let height = width / ratio;
    starNoteStage.style.setProperty('--card-w', `${Math.round(width)}px`);
    starNoteStage.style.setProperty('--card-h', `${Math.round(height)}px`);
  }

  function setStarFlipped(flipped) {
    if (!starFlip) return;
    starFlip.classList.toggle('is-flipped', flipped);
    starFlip.setAttribute('aria-label', flipped ? '翻回照片' : '照片，点击翻转查看留言');
    starFront?.setAttribute('aria-hidden', String(flipped));
    starBack?.setAttribute('aria-hidden', String(!flipped));
    starFront?.toggleAttribute('inert', flipped);
    starBack?.toggleAttribute('inert', !flipped);
    if (!starNote || starNote.hidden) return;
    if (flipped) {
      starNoteText?.focus({ preventScroll: true });
    } else {
      starFlip.focus({ preventScroll: true });
    }
  }

  function openStarNote(index, button) {
    if (!starNote) return;
    lastStarButton = button;
    const isNewStar = !readStars.has(index);
    const photoIndex = isNewStar ? readStars.size : Math.max(0, readStars.size - 1);
    const countLabel = `${String(photoIndex + 1).padStart(2, '0')} / ${starPositions.length}`;
    if (starNoteCount) starNoteCount.textContent = countLabel;
    if (starNoteFrontCount) starNoteFrontCount.textContent = countLabel;
    if (starNoteText) starNoteText.textContent = starMessages[photoIndex];
    if (starNoteTitle) starNoteTitle.textContent = `第 ${String(photoIndex + 1).padStart(2, '0')} 张照片`;
    if (starNoteImage) {
      starNoteImage.src = starPhotos[photoIndex];
      starNoteImage.alt = `第 ${photoIndex + 1} 张生日照片`;
      if (starNoteImage.complete && starNoteImage.naturalWidth) sizeStarNoteCard();
    }
    setStarFlipped(false);

    if (isNewStar) {
      readStars.add(index);
      button.classList.add('is-read');
      button.setAttribute('aria-label', `第 ${index + 1} 颗星，已读`);
      updateStarProgress();
      const nextStar = [...(starField?.querySelectorAll('.star-message') || [])]
        .find((star) => star !== button && !star.classList.contains('is-read'));
      starFocusAfterClose = nextStar || $('#scene-stars .scene-next');
      setTimeout(() => {
        button.classList.add('is-gone');
        button.tabIndex = -1;
        button.setAttribute('aria-hidden', 'true');
      }, 340);
    }

    starNote.hidden = false;
    story?.classList.add('is-locked');
    body.classList.add('star-note-open');
    setTimeout(() => starFlip?.focus({ preventScroll: true }), 40);
  }

  function closeStarNote() {
    if (!starNote || starNote.hidden) return;
    starNote.hidden = true;
    setStarFlipped(false);
    story?.classList.remove('is-locked');
    body.classList.remove('star-note-open');
    (starFocusAfterClose || lastStarButton)?.focus({ preventScroll: true });
    lastStarButton = null;
    starFocusAfterClose = null;
  }

  if (starField) {
    starPositions.forEach(([x, y], index) => {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'star-message';
      star.style.setProperty('--x', `${x}%`);
      star.style.setProperty('--y', `${y}%`);
      star.style.setProperty('--s', `${14 + (index % 6) * 2}px`);
      star.style.setProperty('--dur', `${4.2 + (index % 5) * 0.45}s`);
      star.style.setProperty('--delay', `${(index * 0.37) % 4.5}s`);
      star.setAttribute('aria-label', `第 ${index + 1} 颗星`);
      star.addEventListener('click', () => openStarNote(index, star));
      starField.appendChild(star);
    });
  }

  starNoteImage?.addEventListener('load', sizeStarNoteCard);
  window.addEventListener('resize', () => {
    if (starNote && !starNote.hidden) sizeStarNoteCard();
  });
  starFlip?.addEventListener('click', () => {
    setStarFlipped(!starFlip.classList.contains('is-flipped'));
  });
  starFlip?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setStarFlipped(!starFlip.classList.contains('is-flipped'));
  });
  closeStarNoteButton?.addEventListener('click', closeStarNote);
  closeStarNoteText?.addEventListener('click', (event) => {
    event.stopPropagation();
    closeStarNote();
  });
  starNote?.querySelector('[data-close-star]')?.addEventListener('click', closeStarNote);
  starNote?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeStarNote();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [...starNote.querySelectorAll('button, [tabindex="0"]')].filter((el) =>
      !el.disabled && !el.closest('[inert]') && el.offsetParent !== null
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------------------------------------------------------
     Letter card
     --------------------------------------------------------- */
  const letterCard = $('#letterCard');
  const openLetter = $('#openLetter');
  openLetter?.addEventListener('click', () => {
    if (!letterCard) return;
    const cardBack = $('.letter-card__back', letterCard);
    letterCard.classList.add('is-open');
    $('.letter-card__front', letterCard)?.setAttribute('aria-hidden', 'true');
    cardBack?.setAttribute('aria-hidden', 'false');
    cardBack?.setAttribute('tabindex', '-1');
    cardBack?.focus({ preventScroll: true });
  });

  /* ---------------------------------------------------------
     Birthday cake
     --------------------------------------------------------- */
  const birthdayCake = $('#birthdayCake');
  const cakeCandles = $('#cakeCandles');
  const cakeStatus = $('#cakeStatus');
  const blowCandles = $('#blowCandles');
  const cakeNext = $('#cakeNext');
  const candleTotal = 21;

  if (cakeCandles) {
    for (let index = 0; index < candleTotal; index += 1) {
      const candle = document.createElement('span');
      candle.className = 'bday-candle';
      candle.style.setProperty('--i', String(index));
      cakeCandles.appendChild(candle);
    }
  }

  blowCandles?.addEventListener('click', () => {
    birthdayCake?.classList.add('is-blown');
    if (cakeStatus) cakeStatus.textContent = '愿望不用说出口，星星会替你记得。';
    if (blowCandles) {
      blowCandles.disabled = true;
      blowCandles.textContent = '愿望已收到';
    }
    if (cakeNext) {
      cakeNext.hidden = false;
      cakeNext.focus({ preventScroll: true });
    }
  });

  /* ---------------------------------------------------------
     Name card
     --------------------------------------------------------- */
  const nameForm = $('#nameForm');
  const nameInput = $('#nameInput');
  const noteInput = $('#noteInput');
  const finalName = $('#finalName');
  const finalNote = $('#finalNote');
  const signed = $('#signed');
  const nameNext = $('#nameNext');

  nameForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput?.value.trim() || '王芊予';
    const note = noteInput?.value.trim() || '生日快乐';
    if (finalName) {
      const portrait = finalName.querySelector('img');
      if (portrait) {
        portrait.alt = name;
        finalName.setAttribute('aria-label', name);
      } else {
        finalName.textContent = name;
      }
    }
    if (finalNote) finalNote.textContent = note;
    nameForm.hidden = true;
    if (signed) signed.hidden = false;
    if (nameNext) {
      nameNext.hidden = false;
      nameNext.focus({ preventScroll: true });
    }
  });

  /* ---------------------------------------------------------
     Gift guide · cream page after the final page
     --------------------------------------------------------- */
  const giftGuide = $('#giftGuide');
  const giftClose = $('#giftClose');
  const giftCover = $('#giftCover');
  const finalBackButton = $('#finalBack');
  let giftReturnFocus = null;

  function openGiftGuide() {
    if (!giftGuide) return;
    giftReturnFocus = document.activeElement;
    giftGuide.hidden = false;
    body.classList.add('gift-open');
    if (book) book.inert = true;
    requestAnimationFrame(() => giftClose?.focus({ preventScroll: true }));
  }

  function closeGiftGuide() {
    if (!giftGuide || giftGuide.hidden) return;
    giftGuide.hidden = true;
    body.classList.remove('gift-open');
    if (book) book.inert = false;
    if (giftReturnFocus && document.contains(giftReturnFocus)) {
      giftReturnFocus.focus({ preventScroll: true });
    } else {
      finalBackButton?.focus({ preventScroll: true });
    }
  }

  finalBackButton?.addEventListener('click', openGiftGuide);
  giftClose?.addEventListener('click', closeGiftGuide);
  giftCover?.addEventListener('click', () => {
    closeGiftGuide();
    restartExperience();
  });
  /* ---------------------------------------------------------
     Open a gift box · image + writable note
     --------------------------------------------------------- */
  const giftModal = $('#giftModal');
  const giftModalBackdrop = $('#giftModalBackdrop');
  const giftModalClose = $('#giftModalClose');
  const giftModalKicker = $('#giftModalKicker');
  const giftModalTitle = $('#giftModalTitle');
  const giftModalImage = $('#giftModalImage');
  const giftModalNote = $('#giftModalNote');
  const gifts = {
    '1': { image: 'https://cdn.jsdelivr.net/gh/cshh-bit/birthday-site@v4/assets/photos/gifts/01.webp', alt: 'Prada 彩色唇膏' },
    '2': { image: 'https://cdn.jsdelivr.net/gh/cshh-bit/birthday-site@v4/assets/photos/gifts/02.webp', alt: 'YSL 唇膏' },
    '3': { image: 'https://cdn.jsdelivr.net/gh/cshh-bit/birthday-site@v4/assets/photos/gifts/03.webp', alt: '编织包' },
    '4': { image: 'https://cdn.jsdelivr.net/gh/cshh-bit/birthday-site@v4/assets/photos/gifts/04.webp', alt: 'The Monsters 盲盒' },
    '5': { image: 'https://cdn.jsdelivr.net/gh/cshh-bit/birthday-site@v4/assets/photos/gifts/05.webp', alt: '睡着的照片' }
  };
  const defaultGiftNotes = {
    '1': '为什么选这个呢，可能是因为看过的电影吧，就选了这个牌子，但是他家的口红不好使，就选了唇膏，谁承想，你的唇膏刚好被肖茂掠夺了，嘻嘻',
    '2': '为什么选这个呢，你说要学化妆，也没见你买口红，所以选了一支颜色应该适合你的☝️',
    '3': '为什么选这个呢，你说你的包被孔雀绿污染了，于是乎',
    '4': '为什么选这个呢，直播间刷到觉得这个系列是最好看的拉布布，看你手气了',
    '5': '再送你张睡美人的美照，没别的意思，单纯4个礼物不太好听，嘻嘻'
  };
  let giftNotes = {};
  try { giftNotes = JSON.parse(localStorage.getItem('birthdayGiftNotes') || '{}') || {}; } catch (error) { giftNotes = {}; }
  let activeGift = null;
  let giftModalReturnFocus = null;

  function openGiftModal(id, trigger) {
    const gift = gifts[id];
    if (!giftModal || !gift) return;
    activeGift = id;
    giftModalReturnFocus = trigger || document.activeElement;
    giftModalKicker.textContent = `GIFT 0${id}`;
    giftModalTitle.textContent = `礼物 0${id}`;
    giftModalImage.src = gift.image;
    giftModalImage.alt = gift.alt;
    giftModalNote.value = Object.prototype.hasOwnProperty.call(giftNotes, id) ? giftNotes[id] : (defaultGiftNotes[id] || '');
    giftModal.hidden = false;
    body.classList.add('gift-modal-open');
    if (giftGuide) giftGuide.inert = true;
    requestAnimationFrame(() => giftModalClose?.focus({ preventScroll: true }));
  }

  function closeGiftModal() {
    if (!giftModal || giftModal.hidden) return;
    giftModal.hidden = true;
    body.classList.remove('gift-modal-open');
    if (giftGuide) giftGuide.inert = false;
    activeGift = null;
    if (giftModalReturnFocus && document.contains(giftModalReturnFocus)) {
      giftModalReturnFocus.focus({ preventScroll: true });
    }
  }

  $$('.gift-box').forEach((box) => {
    box.addEventListener('click', () => openGiftModal(box.dataset.gift, box));
  });
  giftModalBackdrop?.addEventListener('click', closeGiftModal);
  giftModalClose?.addEventListener('click', closeGiftModal);
  giftModalNote?.addEventListener('input', () => {
    if (!activeGift) return;
    giftNotes[activeGift] = giftModalNote.value;
    try { localStorage.setItem('birthdayGiftNotes', JSON.stringify(giftNotes)); } catch (error) {}
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !giftModal || giftModal.hidden) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeGiftModal();
  }, true);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !giftGuide || giftGuide.hidden) return;
    if (body.classList.contains('gift-modal-open')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    closeGiftGuide();
  }, true);

  /* ---------------------------------------------------------
     Constellation heart
     --------------------------------------------------------- */
  const heart = $('#heart');
  const heartSvg = $('.heart__lines', heart || document);
  const heartFill = $('#heartFill');
  const heartCount = $('#heartCount');
  const heartMessage = $('#heartMessage');
  const heartHint = $('#heartHint');
  const skipStars = $('#skipStars');
  const heartNext = $('#heartNext');
  const insideHeading = $('#insideTitle');

  // 21 points around a heart, in a 600 x 520 viewBox.
  const heartPoints = [
    [300,145],[309,114],[361,56],[410,35],[454,40],[539,92],[560,185],
    [502,279],[454,320],[405,362],[328,434],[300,480],[272,434],[195,362],
    [146,320],[98,279],[40,185],[61,92],[146,40],[239,56],[291,114]
  ];
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const heartStars = [];
  let litStars = 0;
  let heartSkipping = false;

  function heartPathData(closed = false) {
    return heartPoints
      .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
      .join(' ') + (closed ? ' Z' : '');
  }

  function drawHeartSegment(from, to) {
    if (!heartSvg) return;
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(from[0]));
    line.setAttribute('y1', String(from[1]));
    line.setAttribute('x2', String(to[0]));
    line.setAttribute('y2', String(to[1]));
    line.setAttribute('class', 'heart__segment');
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    line.style.strokeDasharray = String(length);
    line.style.strokeDashoffset = String(length);
    heartSvg.appendChild(line);
    line.getBoundingClientRect();
    requestAnimationFrame(() => {
      line.style.strokeDashoffset = '0';
    });
  }

  function completeHeart() {
    if (!heart) return;
    heart.classList.add('is-complete');
    heart.setAttribute('aria-label', '21 颗星已全部点亮');
    if (insideHeading) insideHeading.textContent = '这片星空，只为你亮着。';
    if (heartHint) heartHint.textContent = '21 颗星，全部属于你。';
    if (heartMessage) {
      heartMessage.setAttribute('aria-hidden', 'false');
      setTimeout(() => heartMessage.focus({ preventScroll: true }), 520);
    }
    if (skipStars) {
      skipStars.hidden = true;
      skipStars.disabled = true;
    }
    if (heartNext) heartNext.hidden = false;
    heartSkipping = false;
  }

  function lightStar(index, fromSkip = false) {
    if (!heart || index !== litStars || litStars >= heartPoints.length) return;
    const star = heartStars[index];
    if (!star) return;

    star.classList.add('is-lit');
    star.classList.remove('is-next');
    star.tabIndex = -1;

    if (litStars > 0) {
      drawHeartSegment(heartPoints[litStars - 1], heartPoints[litStars]);
    }
    litStars += 1;

    if (heartCount) heartCount.textContent = `${litStars} / ${heartPoints.length}`;

    if (litStars === heartPoints.length) {
      drawHeartSegment(heartPoints[heartPoints.length - 1], heartPoints[0]);
      completeHeart();
      return;
    }

    const next = heartStars[litStars];
    if (next) {
      next.classList.add('is-next');
      next.tabIndex = 0;
      next.setAttribute('aria-label', `点亮第 ${litStars + 1} 颗星`);
      if (!fromSkip) next.focus({ preventScroll: true });
    }
  }

  if (heart && heartSvg) {
    heartFill?.setAttribute('d', heartPathData(true));

    heartPoints.forEach(([x, y], index) => {
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'heart-star';
      star.style.setProperty('--x', `${(x / 600) * 100}%`);
      star.style.setProperty('--y', `${(y / 520) * 100}%`);
      star.tabIndex = -1;
      star.setAttribute('aria-label', `第 ${index + 1} 颗星`);
      star.addEventListener('click', () => lightStar(index));
      heart.appendChild(star);
      heartStars.push(star);
    });

    heartStars[0].classList.add('is-next');
    heartStars[0].tabIndex = 0;
    heartStars[0].setAttribute('aria-label', '点亮第 1 颗星');
  }

  skipStars?.addEventListener('click', () => {
    if (!heart || heartSkipping || litStars >= heartPoints.length) return;
    heartSkipping = true;
    skipStars.disabled = true;
    const step = () => {
      if (litStars >= heartPoints.length) {
        heartSkipping = false;
        return;
      }
      lightStar(litStars, true);
      setTimeout(step, 115);
    };
    step();
  });

  if (songEl) {
    songEl.addEventListener('ended', () => {
      if (!usingSong) return;
      usingSong = false;
      isPlaying = false;
      updateSoundUI();
      setGiftOpen(false);
    });
    songEl.addEventListener('error', () => { songUnavailable = true; });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (isPlaying || giftActive)) stopMusic();
  });

  /* ---------------------------------------------------------
     Countdown (Asia/Shanghai)
     --------------------------------------------------------- */
  const landingCountdown = $('#landingCountdown');

  const shanghaiFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  });

  function shanghaiParts(date) {
    const out = {};
    for (const part of shanghaiFmt.formatToParts(date)) {
      if (part.type !== 'literal') out[part.type] = part.value;
    }
    return out;
  }

  function tickCountdown() {
    if (!landingCountdown) return;
    const now = new Date();
    const parts = shanghaiParts(now);
    const month = Number(parts.month);
    const day = Number(parts.day);
    const isToday = month === 10 && day === 28;
    const isAfter = month > 10 || (month === 10 && day > 28);

    if (isToday) {
      landingCountdown.textContent = '今天就是你的日子。';
      return;
    }
    if (isAfter) {
      landingCountdown.textContent = '今年的 10.28 已存档，快乐不设有效期。';
      return;
    }

    const year = Number(parts.year);
    const target = Date.UTC(year, 9, 27, 16, 0, 0); // Oct 28, 00:00 Asia/Shanghai
    const diff = target - now.getTime();
    const d = Math.max(0, Math.floor(diff / 86400000));
    const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
    const m = Math.max(0, Math.floor((diff % 3600000) / 60000));

    if (d > 0) {
      landingCountdown.textContent = `${d} 天后，就是你的日子。`;
    } else if (h > 0) {
      landingCountdown.textContent = `${h} 小时 ${m} 分后，就是你的日子。`;
    } else {
      landingCountdown.textContent = `${Math.max(1, m)} 分钟后，就是你的日子。`;
    }
  }

  tickCountdown();
  setInterval(tickCountdown, 30000);

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  const revealEls = $$('.reveal, .snap');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     Header + active chapter
     --------------------------------------------------------- */
  const siteHead = $('#siteHead');
  const navLinks = $$('.site-nav a');
  const navSections = navLinks
    .map((a) => ({ link: a, section: $(a.getAttribute('href')) }))
    .filter((item) => item.section);
  let scrollTicking = false;

  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const landingH = document.querySelector('.landing')?.offsetHeight || window.innerHeight;
      const pastLanding = y > Math.max(220, landingH - 140);
      body.classList.toggle('is-top', !pastLanding);
      siteHead?.classList.toggle('is-scrolled', pastLanding);

      if (!pastLanding) {
        if (petalRaf) stopPetals();
      } else if (!petalRaf && !reduceMotion) {
        startPetals();
      }

      let active = null;
      for (const item of navSections) {
        if (item.section.getBoundingClientRect().top <= window.innerHeight * 0.38) active = item;
      }
      navLinks.forEach((a) => a.classList.remove('is-active'));
      if (active) active.link.classList.add('is-active');
      scrollTicking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Cake candles
     --------------------------------------------------------- */
  const candles = $$('.candle');
  const wishStatus = $('#wishStatus');
  const wishReveal = $('#wishReveal');
  const resetCandles = $('#resetCandles');
  const candleWord = ['一', '二', '三'];
  const candleCount = ['零', '一', '二', '三'];

  function litCount() {
    return candles.filter((c) => !c.classList.contains('is-out')).length;
  }

  function updateWish(lit) {
    if (wishStatus) {
      if (lit === 0) wishStatus.textContent = '三个愿望，都交给风了。';
      else wishStatus.textContent = `${candleCount[lit]}根蜡烛还亮着，等你吹。`;
    }
    if (resetCandles) resetCandles.hidden = lit !== 0;
    if (wishReveal) {
      const show = lit === 0;
      wishReveal.classList.toggle('is-revealed', show);
      wishReveal.setAttribute('aria-hidden', String(!show));
    }
    if (lit === 0) {
      const stage = $('.cake__stage');
      const rect = stage?.getBoundingClientRect();
      setTimeout(() => {
        fireConfetti(rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
          rect ? rect.top + rect.height * 0.45 : window.innerHeight * 0.55, 150, 1.05);
        setTimeout(() => fireConfetti(window.innerWidth * 0.18, window.innerHeight * 0.62, 48, 0.7), 180);
        setTimeout(() => fireConfetti(window.innerWidth * 0.82, window.innerHeight * 0.62, 48, 0.7), 300);
      }, 260);
    }
  }

  candles.forEach((candle, index) => {
    candle.addEventListener('click', () => {
      if (candle.classList.contains('is-out')) return;
      candle.classList.add('is-out');
      candle.setAttribute('aria-pressed', 'false');
      candle.setAttribute('aria-label', `第${candleWord[index]}根蜡烛已吹灭`);
      updateWish(litCount());
    });
  });

  if (resetCandles) {
    resetCandles.addEventListener('click', () => {
      candles.forEach((candle, index) => {
        candle.classList.remove('is-out');
        candle.setAttribute('aria-pressed', 'true');
        candle.setAttribute('aria-label', `吹灭第${candleWord[index]}根蜡烛`);
      });
      updateWish(candles.length);
      candles[0]?.focus({ preventScroll: true });
    });
  }

  /* ---------------------------------------------------------
     Confetti buttons
     --------------------------------------------------------- */
  $('#finaleConfetti')?.addEventListener('click', () => {
    const y = window.innerHeight * 0.5;
    fireConfetti(window.innerWidth * 0.5, y, 120, 1.1);
    setTimeout(() => fireConfetti(window.innerWidth * 0.12, y * 0.9, 55, 0.8), 160);
    setTimeout(() => fireConfetti(window.innerWidth * 0.88, y * 0.9, 55, 0.8), 300);
  });

  /* ---------------------------------------------------------
     Secret modal
     --------------------------------------------------------- */
  const modal = $('#secretModal');
  const modalCard = $('.modal__card', modal || document);
  const closeSecret = $('#closeSecret');
  const secretSeal = $('#secretSeal');
  let lastFocus = null;

  function modalKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key !== 'Tab' || !modalCard) return;
    const focusables = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', modalCard)
      .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    body.classList.add('modal-open');
    closeSecret?.focus({ preventScroll: true });
    document.addEventListener('keydown', modalKeydown);
    const rect = secretSeal?.getBoundingClientRect();
    if (rect) {
      fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 40, 0.7);
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    body.classList.remove('modal-open');
    document.removeEventListener('keydown', modalKeydown);
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
  }

  secretSeal?.addEventListener('click', openModal);
  closeSecret?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closeModal();
  });

  /* ---------------------------------------------------------
     Resize
     --------------------------------------------------------- */
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (petalCtx) { petalCtx = fitCanvas(petalsCanvas); seedPetals(); }
      if (confettiCtx) confettiCtx = fitCanvas(confettiCanvas);
      if (fireworksCanvas) fireworksCtx = fitCanvas(fireworksCanvas);
    }, 180);
  });

  /* ---------------------------------------------------------
     Pause ambient petals when the tab is hidden
     --------------------------------------------------------- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopPetals();
    else if (petalCtx && !reduceMotion && !petalRaf && !body.classList.contains('is-top')) {
      seedPetals();
      petalLoop();
    }
  });
})();
