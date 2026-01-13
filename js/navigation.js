/**
 * Navigation Module
 * Handles sidebar navigation and page state
 */

// Navigation State
const navState = {
    currentPage: 'home',
    sidebarCollapsed: false,
    sidebarHidden: false
};

// DOM Elements
let navElements = {};

/**
 * Set active page in navigation
 * @param {string} pageName - Name of the page to activate
 */
function setActivePage(pageName) {
    if (!pageName) return;
    
    navState.currentPage = pageName;
    
    // Update nav links
    const navLinks = $$('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkPage = href.replace('.html', '').replace('index', 'home');
        
        if (linkPage === pageName || (pageName === 'home' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Toggle sidebar collapsed state (for tablet)
 */
function toggleSidebarCollapse() {
    navState.sidebarCollapsed = !navState.sidebarCollapsed;
    document.body.classList.toggle('sidebar-collapsed', navState.sidebarCollapsed);
}

/**
 * Toggle sidebar visibility (for mobile)
 */
function toggleSidebarVisibility() {
    const isCurrentlyVisible = document.body.classList.contains('sidebar-visible');
    navState.sidebarHidden = isCurrentlyVisible;
    document.body.classList.toggle('sidebar-visible', !isCurrentlyVisible);
}

/**
 * Close sidebar (for mobile)
 */
function closeSidebar() {
    navState.sidebarHidden = true;
    document.body.classList.remove('sidebar-visible');
}

/**
 * Handle window resize for responsive behavior
 */
function handleResize() {
    const width = window.innerWidth;
    
    if (width > 1024) {
        // Desktop: show full sidebar
        navState.sidebarCollapsed = false;
        navState.sidebarHidden = false;
        document.body.classList.remove('sidebar-collapsed', 'sidebar-visible');
    } else if (width > 768) {
        // Tablet: collapse sidebar
        navState.sidebarCollapsed = true;
        navState.sidebarHidden = false;
        document.body.classList.add('sidebar-collapsed');
        document.body.classList.remove('sidebar-visible');
    } else {
        // Mobile: hide sidebar
        navState.sidebarHidden = true;
        document.body.classList.remove('sidebar-collapsed');
    }
}

/**
 * Detect current page from URL
 * @returns {string} Current page name
 */
function detectCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename.replace('.html', '').replace('index', 'home');
}

/**
 * Initialize navigation module
 */
function initNavigation() {
    // Cache elements
    navElements = {
        sidebar: $('aside'),
        mobileMenuBtn: $('.mobile-menu-btn'),
        navLinks: $$('.nav-link')
    };
    
    // Set initial active page
    const currentPage = detectCurrentPage();
    setActivePage(currentPage);
    
    // Handle initial responsive state
    handleResize();
    
    // Listen for resize
    on(window, 'resize', debounce(handleResize, 150));
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        navState,
        setActivePage,
        toggleSidebarCollapse,
        toggleSidebarVisibility,
        closeSidebar,
        initNavigation
    };
}
