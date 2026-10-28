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
});
