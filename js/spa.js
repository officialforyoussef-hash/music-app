/**
 * SPA Navigation Module
 * Handles client-side navigation without full page reloads
 */

(function() {
    'use strict';
    
    // Cache for loaded pages
    const pageCache = new Map();
    
    // Preloaded images cache
    const imageCache = new Set();
    
    // Loaded CSS files
    const loadedStyles = new Set();
    
    /**
     * Load page-specific CSS
     * @param {string[]} styles - Array of CSS hrefs
     * @returns {Promise} - Resolves when all CSS loaded
     */
    function loadPageStyles(styles) {
        const promises = [];
        
        styles.forEach(href => {
            if (loadedStyles.has(href)) return;
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            const promise = new Promise((resolve) => {
                link.onload = resolve;
                link.onerror = resolve; // Continue even if CSS fails
            });
            
            document.head.appendChild(link);
            loadedStyles.add(href);
            promises.push(promise);
        });
        
        return Promise.all(promises);
    }
    
    /**
     * Preload an image
     * @param {string} src - Image URL
     */
    function preloadImage(src) {
        if (!src || imageCache.has(src)) return;
        
        const img = new Image();
        img.src = src;
        imageCache.add(src);
    }
    
    /**
     * Preload all images from a page content
     * @param {string} html - HTML content
     */
    function preloadImagesFromHTML(html) {
        const imgRegex = /src="(https:\/\/images\.unsplash\.com[^"]+)"/g;
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
            preloadImage(match[1]);
        }
    }
    
    /**
     * Preload images visible on current page
     */
    function preloadVisibleImages() {
        const images = document.querySelectorAll('img[src*="unsplash"]');
        images.forEach(img => {
            preloadImage(img.src);
        });
    }
    
    /**
     * Preload linked pages (hover intent)
     * @param {string} url - Page URL to preload
     */
    async function preloadPage(url) {
        if (pageCache.has(url)) return;
        
        try {
            const response = await fetch(url);
            const html = await response.text();
            pageCache.set(url, html);
            preloadImagesFromHTML(html);
        } catch (e) {
            // Silently fail
        }
    }
    
    /**
     * Extract main content from HTML
     * @param {string} html - Full HTML
     * @returns {Object} - Extracted parts
     */
    function extractContent(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Get ALL CSS files from the page
        const styles = [];
        doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            // Only local CSS files
            if (href && !href.startsWith('http') && href.endsWith('.css')) {
                styles.push(href);
            }
        });
        
        return {
            main: doc.querySelector('main')?.innerHTML || '',
            title: doc.querySelector('title')?.textContent || 'Music App',
            bodyClass: doc.body.className || '',
            styles: styles
        };
    }
    
    /**
     * Navigate to a page without full reload
     * @param {string} url - Target URL
     */
    async function navigateTo(url) {
        // Show loading state
        const main = document.querySelector('main');
        if (!main) return;
        
        main.style.opacity = '0.5';
        main.style.pointerEvents = 'none';
        
        try {
            let html;
            
            if (pageCache.has(url)) {
                html = pageCache.get(url);
            } else {
                const response = await fetch(url);
                html = await response.text();
                pageCache.set(url, html);
            }
            
            const content = extractContent(html);
            
            // Load all CSS if needed
            await loadPageStyles(content.styles);
            
            // Update content with fade
            main.style.transition = 'opacity 0.15s ease';
            main.style.opacity = '0';
            
            await new Promise(resolve => setTimeout(resolve, 150));
            
            main.innerHTML = content.main;
            document.title = content.title;
            
            // Update URL
            history.pushState({ url }, content.title, url);
            
            // Update active nav
            updateActiveNav(url);
            
            // Fade in
            main.style.opacity = '1';
            main.style.pointerEvents = '';
            
            // Scroll to top
            main.scrollTop = 0;
            
            // Preload images in new content
            preloadVisibleImages();
            
            // Re-init any needed JS
            reinitPage();
            
        } catch (e) {
            // Fallback to normal navigation
            window.location.href = url;
        }
    }
    
    /**
     * Update active navigation link
     * @param {string} url - Current URL
     */
    function updateActiveNav(url) {
        const filename = url.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const isActive = href === filename || 
                           (filename === 'index.html' && href === 'index.html') ||
                           (filename === '' && href === 'index.html');
            
            link.classList.toggle('active', isActive);
        });
    }
    
    /**
     * Reinitialize page-specific functionality
     */
    function reinitPage() {
        // Re-setup lazy loading for new images
        const images = document.querySelectorAll('main img[loading="lazy"]');
        images.forEach(img => {
            if (!img.complete) {
                img.style.opacity = '0';
                img.onload = () => {
                    img.style.transition = 'opacity 0.3s';
                    img.style.opacity = '1';
                };
            }
        });
        
        // Dispatch custom event for other modules to listen
        window.dispatchEvent(new CustomEvent('spa:pageload'));
    }
    
    /**
     * Handle link clicks
     * @param {Event} e - Click event
     */
    function handleLinkClick(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        // Skip external links, anchors, and non-HTML
        if (!href || 
            href.startsWith('http') || 
            href.startsWith('#') || 
            href.startsWith('mailto:') ||
            !href.endsWith('.html')) {
            return;
        }
        
        e.preventDefault();
        navigateTo(href);
    }
    
    /**
     * Handle link hover for preloading
     * @param {Event} e - Mouse event
     */
    function handleLinkHover(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        if (href && href.endsWith('.html') && !href.startsWith('http')) {
            preloadPage(href);
        }
    }
    
    /**
     * Handle browser back/forward
     * @param {Event} e - PopState event
     */
    function handlePopState(e) {
        if (e.state?.url) {
            navigateTo(e.state.url);
        } else {
            // Fallback
            navigateTo(window.location.pathname.split('/').pop() || 'index.html');
        }
    }
    
    /**
     * Initialize SPA navigation
     */
    function initSPA() {
        // Register existing CSS files
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http')) {
                loadedStyles.add(href);
            }
        });
        
        // Preload current page images
        preloadVisibleImages();
        
        // Preload nav links on hover
        document.addEventListener('mouseover', handleLinkHover);
        
        // Handle link clicks
        document.addEventListener('click', handleLinkClick);
        
        // Handle browser navigation
        window.addEventListener('popstate', handlePopState);
        
        // Set initial state
        history.replaceState(
            { url: window.location.pathname.split('/').pop() || 'index.html' },
            document.title,
            window.location.href
        );
        
        // Preload adjacent pages after a delay
        setTimeout(() => {
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.endsWith('.html')) {
                    preloadPage(href);
                }
            });
        }, 2000);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSPA);
    } else {
        initSPA();
    }
    
    // Export for use
    window.SPA = {
        navigateTo,
        preloadPage,
        preloadImage
    };
})();
