/**
 * Main Application
 * Initializes all modules and sets up event delegation
 */

(function() {
    'use strict';
    
    /**
     * Initialize application when DOM is ready
     */
    function init() {
        // Initialize modules
        initNavigation();
        initPlayer();
        
        // Setup event listeners
        setupPlayerControls();
        setupCardInteractions();
        setupProfileDropdown();
        setupMobileMenu();
    }
    
    /**
     * Setup player control event listeners
     */
    function setupPlayerControls() {
        const footer = $('footer');
        if (!footer) return;
        
        // Play/Pause button
        const playBtn = $('.play-btn', footer);
        on(playBtn, 'click', togglePlay);
        
        // Shuffle button
        const shuffleBtn = $('[aria-label="Shuffle"]', footer);
        on(shuffleBtn, 'click', toggleShuffle);
        
        // Repeat button
        const repeatBtn = $('[aria-label="Repeat"]', footer);
        on(repeatBtn, 'click', cycleRepeat);
        
        // Progress bar click
        const progressBar = $('.player-progress .progress-bar', footer);
        on(progressBar, 'click', handleProgressClick);
        
        // Volume bar click
        const volumeBar = $('.volume-bar', footer);
        on(volumeBar, 'click', handleVolumeClick);
        
        // Volume button (mute toggle)
        const volumeBtn = $('.volume-control .control-btn', footer);
        on(volumeBtn, 'click', toggleMute);
        
        // Like button
        const likeBtn = $('.player-like-btn', footer);
        on(likeBtn, 'click', handleLikeClick);
    }
    
    /**
     * Handle progress bar click
     * @param {Event} e - Click event
     */
    function handleProgressClick(e) {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const percentage = ((e.clientX - rect.left) / rect.width) * 100;
        setProgress(percentage);
    }
    
    /**
     * Handle volume bar click
     * @param {Event} e - Click event
     */
    function handleVolumeClick(e) {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const level = (e.clientX - rect.left) / rect.width;
        setVolume(level);
    }
    
    /**
     * Handle like button click
     * @param {Event} e - Click event
     */
    function handleLikeClick(e) {
        const btn = e.currentTarget;
        const icon = btn.querySelector('i');
        
        if (icon) {
            const isLiked = icon.classList.contains('fa-solid');
            icon.className = isLiked ? 'fa-regular fa-heart' : 'fa-solid fa-heart';
            btn.classList.toggle('liked', !isLiked);
        }
    }
    
    /**
     * Setup card interaction event listeners using delegation
     */
    function setupCardInteractions() {
        const main = $('main');
        if (!main) return;
        
        // Event delegation for card play buttons and track rows
        on(main, 'click', function(e) {
            // Card play button
            const cardPlayBtn = e.target.closest('.card-play-btn');
            if (cardPlayBtn) {
                e.preventDefault();
                handleCardPlay(cardPlayBtn);
                return;
            }
            
            // Track row play button
            const trackPlayBtn = e.target.closest('.track-play');
            if (trackPlayBtn) {
                e.preventDefault();
                handleTrackRowPlay(trackPlayBtn);
                return;
            }
            
            // Chart row click (trending page)
            const chartRow = e.target.closest('.chart-row');
            if (chartRow) {
                handleChartRowPlay(chartRow);
                return;
            }
            
            // Track row click (not on play button)
            const trackRow = e.target.closest('.track-row');
            if (trackRow) {
                handleTrackRowPlay(trackRow.querySelector('.track-play') || trackRow);
                return;
            }
            
            // Card click (not on play button)
            const card = e.target.closest('.card');
            if (card) {
                handleCardClick(card);
            }
        });
    }
    
    /**
     * Handle chart row play (trending page)
     * @param {Element} chartRow - Chart row element
     */
    function handleChartRowPlay(chartRow) {
        if (!chartRow) return;
        
        const trackData = {
            id: chartRow.dataset.id,
            title: chartRow.dataset.title,
            artist: chartRow.dataset.artist,
            image: chartRow.dataset.image
        };
        
        loadTrack(trackData);
    }
    
    /**
     * Handle track row play
     * @param {Element} element - Track play button or track row
     */
    function handleTrackRowPlay(element) {
        const trackRow = element.closest('.track-row');
        if (!trackRow) return;
        
        const trackData = {
            id: trackRow.dataset.id,
            title: trackRow.dataset.title,
            artist: trackRow.dataset.artist,
            image: trackRow.dataset.image
        };
        
        loadTrack(trackData);
    }
    
    /**
     * Handle card play button click
     * @param {Element} playBtn - Play button element
     */
    function handleCardPlay(playBtn) {
        const card = playBtn.closest('.card');
        if (!card) return;
        
        const trackData = {
            id: card.dataset.id,
            title: card.dataset.title,
            artist: card.dataset.artist,
            image: card.dataset.image
        };
        
        loadTrack(trackData);
    }
    
    /**
     * Handle card click (navigate to detail page)
     * @param {Element} card - Card element
     */
    function handleCardClick(card) {
        // For now, just play the track
        // In a full app, this would navigate to detail page
        const playBtn = card.querySelector('.card-play-btn');
        if (playBtn) {
            handleCardPlay(playBtn);
        }
    }
    
    /**
     * Setup profile dropdown functionality
     */
    function setupProfileDropdown() {
        const profileDropdown = $('.profile-dropdown');
        if (!profileDropdown) return;
        
        const profileBtn = $('.profile-btn', profileDropdown);
        const profileMenu = $('.profile-menu', profileDropdown);
        
        // Toggle dropdown on button click
        on(profileBtn, 'click', function(e) {
            e.stopPropagation();
            const isOpen = !profileMenu.hidden;
            
            profileMenu.hidden = isOpen;
            profileBtn.setAttribute('aria-expanded', !isOpen);
            profileDropdown.classList.toggle('open', !isOpen);
        });
        
        // Close dropdown when clicking outside
        on(document, 'click', function(e) {
            if (!profileDropdown.contains(e.target)) {
                profileMenu.hidden = true;
                profileBtn.setAttribute('aria-expanded', 'false');
                profileDropdown.classList.remove('open');
            }
        });
        
        // Close dropdown on Escape key
        on(document, 'keydown', function(e) {
            if (e.key === 'Escape' && !profileMenu.hidden) {
                profileMenu.hidden = true;
                profileBtn.setAttribute('aria-expanded', 'false');
                profileDropdown.classList.remove('open');
                profileBtn.focus();
            }
        });
    }
    
    /**
     * Setup mobile menu functionality
     */
    function setupMobileMenu() {
        const mobileMenuBtn = $('.mobile-menu-btn');
        if (!mobileMenuBtn) return;
        
        on(mobileMenuBtn, 'click', toggleSidebarVisibility);
        
        // Close sidebar when clicking on overlay (mobile)
        on(document, 'click', function(e) {
            if (window.innerWidth <= 768) {
                const sidebar = $('aside');
                const isClickOutside = !sidebar.contains(e.target) && 
                                       !mobileMenuBtn.contains(e.target);
                
                if (isClickOutside && document.body.classList.contains('sidebar-visible')) {
                    closeSidebar();
                }
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
