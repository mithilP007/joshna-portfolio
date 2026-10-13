/**
 * Multi-Page Navigation & Drawer Logic
 * Intercepts navigation clicks to show only the active section,
 * handles responsive slide-out drawer on mobile, and manages active states.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Grab all navigation links and all page sections
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.page-section');
  
  // Header, Drawer, and Utility Elements
  const header = document.querySelector('.site-header');
  const menuToggleBtn = document.querySelector('.menu-toggle-btn');
  const drawerCloseBtn = document.querySelector('.drawer-close-btn');
  const drawerMenu = document.querySelector('.drawer-menu');
  const drawerBackdrop = document.querySelector('.drawer-backdrop');
  const backToTopBtn = document.querySelector('.back-to-top');

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

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawerMenu && drawerMenu.classList.contains('active')) {
      closeDrawer();
      if (menuToggleBtn) menuToggleBtn.focus();
    }
  });

  // --- Core Navigation Logic: Switch Active Slide ---
  function activateSection(targetId) {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    // 1. Hide ALL sections
    sections.forEach(section => {
      section.classList.remove('active-section');
    });

    // 2. Show ONLY the target section
    targetSection.classList.add('active-section');

    // 3. Update active state across all navigation menus (desktop & mobile)
    navLinks.forEach(nav => nav.classList.remove('active-link'));
    document.querySelectorAll(`.nav-link[href="#${targetId}"]`).forEach(nav => {
      nav.classList.add('active-link');
    });

    // 4. Close drawer if open on mobile
    closeDrawer();

    // 5. Scroll to top of the page when a new slide opens
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 6. Update URL hash without causing a page jump
    if (history.pushState) {
      history.pushState(null, '', `#${targetId}`);
    } else {
      window.location.hash = targetId;
    }
  }

  // Bind click event to all navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); // Stop default anchor jumping behavior
      
      // Get the target section ID from the href (e.g., "#about")
      const targetId = this.getAttribute('href').substring(1);
      activateSection(targetId);
    });
  });

  // Handle direct page loads or back/forward navigation with hash
  function checkUrlHash() {
    const hash = window.location.hash.substring(1);
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
});
