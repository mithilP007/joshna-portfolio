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

  // Men Dropdown elements
  const menNavDropdown = document.getElementById('men-nav-dropdown');
  const menDropdownToggle = document.getElementById('men-dropdown-toggle');
  const drawerMenToggle = document.getElementById('drawer-men-toggle');
  const drawerMenSubnav = document.getElementById('drawer-men-subnav');

  const menCategories = ['graphic-tshirt', 'casual-formal', 'smart-casual', 'urban'];

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

  // --- Desktop Men Dropdown Interactions ---
  function closeDesktopDropdown() {
    if (menNavDropdown) {
      menNavDropdown.classList.remove('is-open');
    }
    if (menDropdownToggle) {
      menDropdownToggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (menDropdownToggle && menNavDropdown) {
    menDropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = menNavDropdown.classList.toggle('is-open');
      menDropdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Close desktop dropdown on outside click
  document.addEventListener('click', (e) => {
    if (menNavDropdown && !menNavDropdown.contains(e.target)) {
      closeDesktopDropdown();
    }
  });

  // --- Mobile Drawer Men Accordion Interaction ---
  if (drawerMenToggle && drawerMenSubnav) {
    drawerMenToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = drawerMenToggle.getAttribute('aria-expanded') === 'true';
      drawerMenToggle.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
      drawerMenSubnav.classList.toggle('collapsed', isExpanded);
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (drawerMenu && drawerMenu.classList.contains('active')) {
        closeDrawer();
        if (menuToggleBtn) menuToggleBtn.focus();
      }
      if (menNavDropdown && menNavDropdown.classList.contains('is-open')) {
        closeDesktopDropdown();
        if (menDropdownToggle) menDropdownToggle.focus();
      }
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

    // 3. Update active state across all navigation menus (desktop, dropdown, pills, mobile drawer)
    navLinks.forEach(nav => nav.classList.remove('active-link'));
    document.querySelectorAll(`.nav-link[href="#${targetId}"]`).forEach(nav => {
      nav.classList.add('active-link');
    });

    // 4. Update 'Men' parent active state if viewing one of the men's categories
    if (menCategories.includes(targetId)) {
      if (menDropdownToggle) menDropdownToggle.classList.add('active-parent');
      if (drawerMenToggle) drawerMenToggle.classList.add('active-parent');
    } else {
      if (menDropdownToggle) menDropdownToggle.classList.remove('active-parent');
      if (drawerMenToggle) drawerMenToggle.classList.remove('active-parent');
    }

    // 5. Close drawer & dropdown if open
    closeDrawer();
    closeDesktopDropdown();

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
