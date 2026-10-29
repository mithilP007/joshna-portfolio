/**
 * Multi-Page Navigation & Drawer Logic
 * Intercepts navigation clicks to show only the active section,
 * handles responsive slide-out drawer on mobile, and manages active states.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Grab all navigation links and all page sections
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.page-section');
  
  // Header, Drawer, Dropdowns, and Utility Elements
  const header = document.querySelector('.site-header');
  const menuToggleBtn = document.querySelector('.menu-toggle-btn');
  const drawerCloseBtn = document.querySelector('.drawer-close-btn');
  const drawerMenu = document.querySelector('.drawer-menu');
  const drawerBackdrop = document.querySelector('.drawer-backdrop');
  const backToTopBtn = document.querySelector('.back-to-top');
  const heroVideo = document.getElementById('hero-character-video');
  const heroAudio = document.getElementById('hero-character-audio');
  const heroVideoBox = document.querySelector('.hero-video-box');
  const soundToggleBtn = document.getElementById('hero-sound-toggle-btn');

  // Audio Engine State
  let audioCtx = null;
  let gainNode = null;
  let audioBuffer = null;
  let currentSource = null;
  let isSoundEnabled = true; // Enabled (Sound: ON) by default per user requirement
  let isDecodingBuffer = false;
  let isWebAudioActive = false;
  let lastSyncVideoTime = 0;

  // Dropdown navigation elements
  const womensNavDropdown = document.getElementById('womens-nav-dropdown');
  const womensDropdownToggle = document.getElementById('womens-dropdown-toggle');
  const drawerWomensToggle = document.getElementById('drawer-womens-toggle');
  const drawerWomensSubnav = document.getElementById('drawer-womens-subnav');

  const menNavDropdown = document.getElementById('men-nav-dropdown');
  const menDropdownToggle = document.getElementById('men-dropdown-toggle');
  const drawerMenToggle = document.getElementById('drawer-men-toggle');
  const drawerMenSubnav = document.getElementById('drawer-men-subnav');

  // Subcategory mapping for parent active state indicators
  const womensCategories = ['seasonal-fusion', 'graphic-tshirt-design', 'summer-graphic-prints'];
  const menCategories = ['graphic-tshirt', 'casual-formal', 'smart-casual', 'urban'];

  // Legacy ID mapping for backwards compatibility
  const legacyAliases = {
    'womens': 'seasonal-fusion',
    'tropical-rush': 'seasonal-fusion',
    'y2k-reloaded': 'graphic-tshirt-design',
    'weekend-carnival': 'summer-graphic-prints'
  };

  // --- Drawer Open / Close Functions ---
  function openDrawer() {
    if (!drawerMenu) return;
    drawerMenu.classList.add('active');
    if (drawerBackdrop) drawerBackdrop.classList.add('active');
    if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'true');
    drawerMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (drawerCloseBtn) drawerCloseBtn.focus();
  }

  function closeDrawer() {
    if (!drawerMenu) return;
    drawerMenu.classList.remove('active');
    if (drawerBackdrop) drawerBackdrop.classList.remove('active');
    if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'false');
    drawerMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', () => {
      drawerMenu.classList.contains('active') ? closeDrawer() : openDrawer();
    });
  }

  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  // --- Desktop Dropdown Interactions ---
  function closeDesktopDropdowns() {
    if (womensNavDropdown) {
      womensNavDropdown.classList.remove('is-open');
    }
    if (womensDropdownToggle) {
      womensDropdownToggle.setAttribute('aria-expanded', 'false');
    }
    if (menNavDropdown) {
      menNavDropdown.classList.remove('is-open');
    }
    if (menDropdownToggle) {
      menDropdownToggle.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleDropdown(dropdownEl, toggleBtn, otherDropdownEl, otherToggleBtn) {
    if (!dropdownEl || !toggleBtn) return;
    if (otherDropdownEl && otherToggleBtn) {
      otherDropdownEl.classList.remove('is-open');
      otherToggleBtn.setAttribute('aria-expanded', 'false');
    }
    const isOpen = dropdownEl.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  if (womensDropdownToggle && womensNavDropdown) {
    womensDropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(womensNavDropdown, womensDropdownToggle, menNavDropdown, menDropdownToggle);
    });
  }

  if (menDropdownToggle && menNavDropdown) {
    menDropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(menNavDropdown, menDropdownToggle, womensNavDropdown, womensDropdownToggle);
    });
  }

  // Close desktop dropdowns on outside click
  document.addEventListener('click', (e) => {
    const clickedInsideWomens = womensNavDropdown && womensNavDropdown.contains(e.target);
    const clickedInsideMen = menNavDropdown && menNavDropdown.contains(e.target);
    if (!clickedInsideWomens && !clickedInsideMen) {
      closeDesktopDropdowns();
    }
  });

  // --- Mobile Drawer Accordion Interactions ---
  function setupDrawerAccordion(toggleBtn, subnavEl) {
    if (toggleBtn && subnavEl) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        toggleBtn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        subnavEl.classList.toggle('collapsed', isExpanded);
      });
    }
  }

  setupDrawerAccordion(drawerWomensToggle, drawerWomensSubnav);
  setupDrawerAccordion(drawerMenToggle, drawerMenSubnav);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (drawerMenu && drawerMenu.classList.contains('active')) {
        closeDrawer();
        if (menuToggleBtn) menuToggleBtn.focus();
      }
      closeDesktopDropdowns();
    }
  });

  // --- Core Navigation Logic: Switch Active Slide ---
  function activateSection(targetId) {
    if (legacyAliases[targetId]) {
      targetId = legacyAliases[targetId];
    }

    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    // 1. Hide ALL sections
    sections.forEach(section => {
      section.classList.remove('active-section');
    });

    // 2. Show ONLY the target section
    targetSection.classList.add('active-section');

    // 3. Update active state across all navigation menus (desktop, dropdown, pills, mobile drawer)
    navLinks.forEach(nav => nav.classList.remove('active-link'));
    document.querySelectorAll(`.nav-link[href="#${targetId}"]`).forEach(nav => {
      nav.classList.add('active-link');
    });

    // 4. Update 'Womens' parent active state
    if (womensCategories.includes(targetId)) {
      if (womensDropdownToggle) womensDropdownToggle.classList.add('active-parent');
      if (drawerWomensToggle) drawerWomensToggle.classList.add('active-parent');
    } else {
      if (womensDropdownToggle) womensDropdownToggle.classList.remove('active-parent');
      if (drawerWomensToggle) drawerWomensToggle.classList.remove('active-parent');
    }

    // Update 'Men' parent active state
    if (menCategories.includes(targetId)) {
      if (menDropdownToggle) menDropdownToggle.classList.add('active-parent');
      if (drawerMenToggle) drawerMenToggle.classList.add('active-parent');
    } else {
      if (menDropdownToggle) menDropdownToggle.classList.remove('active-parent');
      if (drawerMenToggle) drawerMenToggle.classList.remove('active-parent');
    }

    // Pause video & audio when navigating away from About me, resume when returning
    if (targetId === 'about') {
      if (heroVideo && heroVideo.paused) heroVideo.play().catch(() => {});
      if (isSoundEnabled) {
        playSoundNow();
      }
    } else {
      if (heroVideo && !heroVideo.paused) heroVideo.pause();
      if (audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend().catch(() => {});
      }
      if (heroAudio && !heroAudio.paused) {
        heroAudio.pause();
      }
    }

    // 5. Close drawer & dropdowns if open
    closeDrawer();
    closeDesktopDropdowns();

    // 6. Scroll to top of the page when a new slide opens
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 7. Update URL hash without causing a page jump
    if (history.pushState) {
      history.pushState(null, '', `#${targetId}`);
    } else {
      window.location.hash = targetId;
    }
  }

  // Bind click event to all navigation links that have href="#id"
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) {
        return; // Don't intercept buttons or non-anchor nav-links
      }
      e.preventDefault(); // Stop default anchor jumping behavior
      
      const targetId = href.substring(1);
      activateSection(targetId);
    });
  });

  // Handle direct page loads or back/forward navigation with hash
  function checkUrlHash() {
    let hash = window.location.hash.substring(1);
    if (legacyAliases[hash]) {
      hash = legacyAliases[hash];
    }
    if (hash && document.getElementById(hash)) {
      activateSection(hash);
    }
  }
  window.addEventListener('hashchange', checkUrlHash);
  if (window.location.hash) {
    checkUrlHash();
  }

  // --- Scroll Header Shadow & Back to Top visibility ---
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    if (header) {
      scrollPos > 10 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
    }

    if (backToTopBtn) {
      scrollPos > 300 ? backToTopBtn.classList.add('visible') : backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Fail-Safe Dual-Engine Audio & Hero Character Controller ---
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
        gainNode.connect(audioCtx.destination);
      }
    }
    return audioCtx;
  }

  async function loadAudioBuffer() {
    if (audioBuffer) return audioBuffer;
    if (isDecodingBuffer) return null;
    isDecodingBuffer = true;
    try {
      getAudioContext();
      let resp = null;
      try {
        resp = await fetch('character_audio.wav');
        if (!resp.ok) throw new Error('Root wav failed: ' + resp.status);
      } catch (err) {
        resp = await fetch('images/character_audio.wav');
      }
      const arrayBuf = await resp.arrayBuffer();
      if (audioCtx) {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
        // If sound is enabled and running, seamlessly transition to Web Audio
        if (isSoundEnabled && audioCtx.state === 'running') {
          playAudioBufferNode(heroVideo ? heroVideo.currentTime : 0);
          if (heroAudio) {
            heroAudio.pause();
            heroAudio.muted = true;
          }
        }
      }
      return audioBuffer;
    } catch (e) {
      console.warn('Could not decode character audio buffer:', e);
      return null;
    } finally {
      isDecodingBuffer = false;
    }
  }

  function playAudioBufferNode(startOffset = 0) {
    if (!audioCtx || !audioBuffer || !isSoundEnabled) return;

    if (currentSource) {
      try {
        currentSource.stop();
        currentSource.disconnect();
      } catch (e) {}
      currentSource = null;
    }

    try {
      currentSource = audioCtx.createBufferSource();
      currentSource.buffer = audioBuffer;
      currentSource.loop = true;
      currentSource.loopStart = 0;
      currentSource.loopEnd = audioBuffer.duration;
      currentSource.connect(gainNode);

      const offset = Math.max(0, startOffset % audioBuffer.duration);
      lastSyncVideoTime = offset;
      currentSource.start(0, offset);
      isWebAudioActive = true;
    } catch (e) {
      console.warn('Error starting audio source node:', e);
    }
  }

  function stopAudioBufferNode() {
    if (currentSource) {
      try {
        currentSource.stop();
        currentSource.disconnect();
      } catch (e) {}
      currentSource = null;
    }
    isWebAudioActive = false;
  }

  function updateSoundUI(audible) {
    if (!soundToggleBtn) return;
    const iconOn = soundToggleBtn.querySelector('.sound-icon-on');
    const iconOff = soundToggleBtn.querySelector('.sound-icon-off');
    const textSpan = soundToggleBtn.querySelector('.sound-btn-text');

    if (audible) {
      soundToggleBtn.classList.remove('is-muted');
      if (iconOn) iconOn.style.display = 'block';
      if (iconOff) iconOff.style.display = 'none';
      if (textSpan) textSpan.textContent = 'Sound: ON';
      soundToggleBtn.setAttribute('aria-pressed', 'true');
    } else {
      soundToggleBtn.classList.add('is-muted');
      if (iconOn) iconOn.style.display = 'none';
      if (iconOff) iconOff.style.display = 'block';
      if (textSpan) textSpan.textContent = 'Sound: OFF';
      soundToggleBtn.setAttribute('aria-pressed', 'false');
    }
  }

  function playSoundNow() {
    if (!isSoundEnabled) return;
    updateSoundUI(true);

    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const curOffset = heroVideo ? heroVideo.currentTime : 0;

    // 1. If Web Audio buffer is ready, play through Web Audio API
    if (ctx && audioBuffer) {
      playAudioBufferNode(curOffset);
      hideSoundHint();
      if (heroAudio) {
        heroAudio.pause();
        heroAudio.muted = true;
      }
    } else if (heroAudio) {
      // 2. Parallel Fail-Safe: HTML5 audio plays immediately while buffer is decoding
      heroAudio.muted = false;
      heroAudio.volume = 1.0;
      if (curOffset > 0) {
        try {
          heroAudio.currentTime = curOffset % (heroAudio.duration || 10);
        } catch (e) {}
      }
      heroAudio.play().then(() => {
        hideSoundHint();
      }).catch(() => {});
    }
  }

  function stopSound() {
    isSoundEnabled = false;
    updateSoundUI(false);
    stopAudioBufferNode();
    if (heroAudio) {
      heroAudio.pause();
      heroAudio.muted = true;
    }
    if (audioCtx && audioCtx.state === 'running') {
      try {
        audioCtx.suspend();
      } catch (e) {}
    }
  }

  function toggleSound() {
    if (isSoundEnabled) {
      stopSound();
    } else {
      isSoundEnabled = true;
      playSoundNow();
    }
  }

  const soundHint = document.getElementById('hero-sound-hint');
  let soundHintTimer = null;

  function showSoundHint() {
    if (soundHint && isSoundEnabled && (!audioCtx || audioCtx.state !== 'running') && (!heroAudio || heroAudio.paused)) {
      soundHint.classList.add('is-visible');
    }
  }

  function hideSoundHint() {
    clearTimeout(soundHintTimer);
    if (soundHint) {
      soundHint.classList.remove('is-visible');
    }
  }

  if (soundHint) {
    soundHint.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playSoundNow();
      hideSoundHint();
    });
  }

  // Pre-load audio buffer immediately on page load
  loadAudioBuffer();

  // Attempt immediate sound playback on load
  if (isSoundEnabled) {
    playSoundNow();
    soundHintTimer = setTimeout(showSoundHint, 700);
  }

  // Synchronous User Gesture Auto-Activation
  const gestureEvents = ['click', 'pointerdown', 'mousedown', 'touchstart', 'touchend', 'keydown', 'wheel', 'scroll'];
  function onUserGesture(e) {
    if (e && e.target && e.target.closest && e.target.closest('#hero-sound-toggle-btn')) {
      return; // Handled exclusively by the toggle button handler
    }
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (isSoundEnabled) {
      playSoundNow();
      hideSoundHint();
    }
  }

  gestureEvents.forEach(evt => {
    window.addEventListener(evt, onUserGesture, { capture: true, passive: true });
    document.addEventListener(evt, onUserGesture, { capture: true, passive: true });
  });

  // Ensure Video Playback & Loop Synchronization
  if (heroVideo) {
    function ensureVideoPlayback() {
      heroVideo.muted = true; // Video element remains muted so browser never blocks or stalls video
      if (heroVideo.paused) {
        heroVideo.play().catch(() => {});
      }
    }

    ensureVideoPlayback();
    heroVideo.addEventListener('loadedmetadata', ensureVideoPlayback);
    heroVideo.addEventListener('canplay', ensureVideoPlayback);

    heroVideo.addEventListener('ended', () => {
      heroVideo.currentTime = 0;
      ensureVideoPlayback();
      if (isSoundEnabled) {
        if (isWebAudioActive) {
          playAudioBufferNode(0);
        } else if (heroAudio) {
          heroAudio.currentTime = 0;
          heroAudio.play().catch(() => {});
        }
      }
    });

    heroVideo.addEventListener('timeupdate', () => {
      if (isSoundEnabled) {
        if (isWebAudioActive && currentSource) {
          if (heroVideo.currentTime < lastSyncVideoTime - 0.5) {
            playAudioBufferNode(heroVideo.currentTime);
          }
        } else if (heroAudio && !heroAudio.paused && Math.abs(heroVideo.currentTime - heroAudio.currentTime) > 0.5) {
          try {
            heroAudio.currentTime = heroVideo.currentTime % (heroAudio.duration || 10);
          } catch (e) {}
        }
      }
    });
  }

  // Sound Toggle Button Handler
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSound();
    });
  }

  // Video Box Click Handler
  if (heroVideoBox) {
    heroVideoBox.addEventListener('click', (e) => {
      if (e.target.closest('#hero-sound-toggle-btn')) return;
      if (heroVideo && heroVideo.paused) {
        heroVideo.play().catch(() => {});
      }
      if (isSoundEnabled) {
        playSoundNow();
      }
    });
  }

  // Handle Tab Switch (Visibility Change)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (heroVideo && !heroVideo.paused) heroVideo.pause();
      if (audioCtx && audioCtx.state === 'running') {
        audioCtx.suspend().catch(() => {});
      }
      if (heroAudio && !heroAudio.paused) {
        heroAudio.pause();
      }
    } else {
      const activeSection = document.querySelector('.page-section.active-section');
      if (activeSection && activeSection.id === 'about') {
        if (heroVideo && heroVideo.paused) heroVideo.play().catch(() => {});
        if (isSoundEnabled) {
          playSoundNow();
        }
      }
    }
  });
});
