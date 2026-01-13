/**
 * Mobile Gestures Module
 * Handles touch interactions for mobile devices
 */

(function() {
    'use strict';
    
    // Only run on mobile
    if (window.innerWidth > 768) return;
    
    // State
    const state = {
        pullToRefresh: {
            startY: 0,
            pulling: false,
            threshold: 80
        },
        swipe: {
            startX: 0,
            startY: 0,
            currentCard: null
        },
        expandedPlayer: false
    };
    
    /**
     * Initialize mobile gestures
     */
    function init() {
        createPullToRefreshElement();
        createBottomSheetElement();
        createExpandedPlayerElement();
        setupPullToRefresh();
        setupCardSwipe();
        setupBottomSheet();
        setupExpandedPlayer();
    }
    
    // ========================================
    // PULL TO REFRESH
    // ========================================
    
    function createPullToRefreshElement() {
        const ptr = document.createElement('div');
        ptr.className = 'pull-to-refresh';
        ptr.innerHTML = '<i class="fa-solid fa-arrow-rotate-right pull-to-refresh-icon"></i>';
        document.body.appendChild(ptr);
    }
    
    function setupPullToRefresh() {
        const main = $('main');
        const ptr = $('.pull-to-refresh');
        if (!main || !ptr) return;
        
        let startY = 0;
        let pulling = false;
        let isAtTop = false;
        
        on(main, 'touchstart', function(e) {
            // Only enable if scrolled to very top
            if (main.scrollTop <= 0) {
                startY = e.touches[0].clientY;
                isAtTop = true;
            } else {
                isAtTop = false;
            }
            pulling = false;
        }, { passive: true });
        
        on(main, 'touchmove', function(e) {
            if (!isAtTop) return;
            
            const currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            
            // Only trigger if pulling down significantly (not just scrolling)
            if (diff > 30 && main.scrollTop <= 0) {
                pulling = true;
                ptr.classList.add('visible');
                
                if (diff > state.pullToRefresh.threshold) {
                    ptr.classList.add('pulling');
                } else {
                    ptr.classList.remove('pulling');
                }
            }
        }, { passive: true });
        
        on(main, 'touchend', function() {
            if (!pulling) {
                ptr.classList.remove('visible', 'pulling');
                return;
            }
            
            pulling = false;
            isAtTop = false;
            
            if (ptr.classList.contains('pulling')) {
                ptr.classList.remove('pulling');
                ptr.classList.add('refreshing');
                
                // Simulate refresh
                setTimeout(function() {
                    ptr.classList.remove('refreshing', 'visible');
                }, 1500);
            } else {
                ptr.classList.remove('visible');
            }
        });
    }
    
    // ========================================
    // BOTTOM SHEET
    // ========================================
    
    function createBottomSheetElement() {
        const overlay = document.createElement('div');
        overlay.className = 'bottom-sheet-overlay';
        
        const sheet = document.createElement('div');
        sheet.className = 'bottom-sheet';
        sheet.innerHTML = `
            <div class="bottom-sheet-handle"></div>
            <div class="bottom-sheet-header">
                <img class="bottom-sheet-image" src="" alt="">
                <div class="bottom-sheet-info">
                    <div class="bottom-sheet-title"></div>
                    <div class="bottom-sheet-subtitle"></div>
                </div>
            </div>
            <div class="bottom-sheet-content">
                <button class="bottom-sheet-item" data-action="like">
                    <i class="fa-regular fa-heart"></i>
                    <span>Like</span>
                </button>
                <button class="bottom-sheet-item" data-action="add-playlist">
                    <i class="fa-solid fa-plus"></i>
                    <span>Add to Playlist</span>
                </button>
                <button class="bottom-sheet-item" data-action="queue">
                    <i class="fa-solid fa-list"></i>
                    <span>Add to Queue</span>
                </button>
                <button class="bottom-sheet-item" data-action="share">
                    <i class="fa-solid fa-share"></i>
                    <span>Share</span>
                </button>
                <button class="bottom-sheet-item" data-action="artist">
                    <i class="fa-solid fa-user"></i>
                    <span>Go to Artist</span>
                </button>
                <button class="bottom-sheet-item" data-action="album">
                    <i class="fa-solid fa-record-vinyl"></i>
                    <span>Go to Album</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(sheet);
    }
    
    function setupBottomSheet() {
        const overlay = $('.bottom-sheet-overlay');
        const sheet = $('.bottom-sheet');
        if (!overlay || !sheet) return;
        
        // Close on overlay click
        on(overlay, 'click', closeBottomSheet);
        
        // Handle sheet item clicks
        on(sheet, 'click', function(e) {
            const item = e.target.closest('.bottom-sheet-item');
            if (item) {
                const action = item.dataset.action;
                handleBottomSheetAction(action);
                closeBottomSheet();
            }
        });
        
        // Swipe down to close
        let startY = 0;
        on(sheet, 'touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        on(sheet, 'touchend', function(e) {
            const endY = e.changedTouches[0].clientY;
            if (endY - startY > 100) {
                closeBottomSheet();
            }
        });
    }
    
    function openBottomSheet(trackData) {
        const overlay = $('.bottom-sheet-overlay');
        const sheet = $('.bottom-sheet');
        if (!overlay || !sheet) return;
        
        // Update content
        const img = $('.bottom-sheet-image', sheet);
        const title = $('.bottom-sheet-title', sheet);
        const subtitle = $('.bottom-sheet-subtitle', sheet);
        
        if (img) img.src = trackData.image || '';
        if (title) title.textContent = trackData.title || 'Unknown';
        if (subtitle) subtitle.textContent = trackData.artist || 'Unknown Artist';
        
        // Store track data
        sheet.dataset.trackId = trackData.id || '';
        
        // Show
        overlay.classList.add('visible');
        sheet.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
    
    function closeBottomSheet() {
        const overlay = $('.bottom-sheet-overlay');
        const sheet = $('.bottom-sheet');
        if (!overlay || !sheet) return;
        
        overlay.classList.remove('visible');
        sheet.classList.remove('visible');
        document.body.style.overflow = '';
    }
    
    function handleBottomSheetAction(action) {
        // Handle different actions
        switch(action) {
            case 'like':
                console.log('Liked track');
                break;
            case 'add-playlist':
                console.log('Add to playlist');
                break;
            case 'queue':
                console.log('Added to queue');
                break;
            case 'share':
                if (navigator.share) {
                    navigator.share({ title: 'Check out this track!' });
                }
                break;
            default:
                console.log('Action:', action);
        }
    }
    
    // ========================================
    // CARD SWIPE
    // ========================================
    
    function setupCardSwipe() {
        const main = $('main');
        if (!main) return;
        
        // Long press to open bottom sheet
        let pressTimer = null;
        
        on(main, 'touchstart', function(e) {
            const card = e.target.closest('.card');
            if (!card) return;
            
            pressTimer = setTimeout(function() {
                const trackData = {
                    id: card.dataset.id,
                    title: card.dataset.title,
                    artist: card.dataset.artist,
                    image: card.dataset.image
                };
                openBottomSheet(trackData);
            }, 500);
        }, { passive: true });
        
        on(main, 'touchend', function() {
            clearTimeout(pressTimer);
        });
        
        on(main, 'touchmove', function() {
            clearTimeout(pressTimer);
        }, { passive: true });
    }
    
    // ========================================
    // EXPANDED PLAYER
    // ========================================
    
    function createExpandedPlayerElement() {
        const player = document.createElement('div');
        player.className = 'expanded-player';
        player.innerHTML = `
            <div class="expanded-player-header">
                <button class="expanded-player-close" aria-label="Close">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div class="expanded-player-source">Playing from Playlist</div>
                <button class="expanded-player-more" aria-label="More options">
                    <i class="fa-solid fa-ellipsis"></i>
                </button>
            </div>
            <div class="expanded-player-cover">
                <img src="https://picsum.photos/seed/track1/400/400" alt="Album cover">
            </div>
            <div class="expanded-player-info">
                <div class="expanded-player-title">No track playing</div>
                <div class="expanded-player-artist">Select a song</div>
            </div>
            <div class="expanded-player-progress">
                <div class="progress-bar" role="slider" aria-label="Track progress">
                    <div class="progress-bar-fill" style="width: 0%;"></div>
                    <div class="progress-bar-handle" style="left: 0%;"></div>
                </div>
                <div class="expanded-player-times">
                    <span>0:00</span>
                    <span>0:00</span>
                </div>
            </div>
            <div class="expanded-player-controls">
                <button class="control-btn" aria-label="Shuffle">
                    <i class="fa-solid fa-shuffle"></i>
                </button>
                <button class="control-btn" aria-label="Previous">
                    <i class="fa-solid fa-backward-step"></i>
                </button>
                <button class="play-btn" aria-label="Play">
                    <i class="fa-solid fa-play"></i>
                </button>
                <button class="control-btn" aria-label="Next">
                    <i class="fa-solid fa-forward-step"></i>
                </button>
                <button class="control-btn" aria-label="Repeat">
                    <i class="fa-solid fa-repeat"></i>
                </button>
            </div>
            <div class="expanded-player-actions">
                <button class="control-btn" aria-label="Device">
                    <i class="fa-solid fa-mobile-screen"></i>
                </button>
                <button class="control-btn" aria-label="Like">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <button class="control-btn" aria-label="Share">
                    <i class="fa-solid fa-share"></i>
                </button>
                <button class="control-btn" aria-label="Queue">
                    <i class="fa-solid fa-list"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(player);
    }
    
    function setupExpandedPlayer() {
        const footer = $('footer');
        const expandedPlayer = $('.expanded-player');
        if (!footer || !expandedPlayer) return;
        
        // Tap on mini player to expand
        on(footer, 'click', function(e) {
            // Don't expand if clicking controls
            if (e.target.closest('button')) return;
            openExpandedPlayer();
        });
        
        // Close button
        const closeBtn = $('.expanded-player-close', expandedPlayer);
        on(closeBtn, 'click', closeExpandedPlayer);
        
        // More options button
        const moreBtn = $('.expanded-player-more', expandedPlayer);
        on(moreBtn, 'click', function() {
            const trackData = {
                id: '1',
                title: $('.expanded-player-title', expandedPlayer).textContent,
                artist: $('.expanded-player-artist', expandedPlayer).textContent,
                image: $('.expanded-player-cover img', expandedPlayer).src
            };
            openBottomSheet(trackData);
        });
        
        // Play button in expanded player
        const playBtn = $('.expanded-player-controls .play-btn', expandedPlayer);
        on(playBtn, 'click', function() {
            togglePlay();
            syncExpandedPlayer();
        });
        
        // Swipe down to close
        let startY = 0;
        on(expandedPlayer, 'touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        on(expandedPlayer, 'touchend', function(e) {
            const endY = e.changedTouches[0].clientY;
            if (endY - startY > 150) {
                closeExpandedPlayer();
            }
        });
    }
    
    function openExpandedPlayer() {
        const expandedPlayer = $('.expanded-player');
        if (!expandedPlayer) return;
        
        syncExpandedPlayer();
        expandedPlayer.classList.add('visible');
        document.body.style.overflow = 'hidden';
        state.expandedPlayer = true;
    }
    
    function closeExpandedPlayer() {
        const expandedPlayer = $('.expanded-player');
        if (!expandedPlayer) return;
        
        expandedPlayer.classList.remove('visible');
        document.body.style.overflow = '';
        state.expandedPlayer = false;
    }
    
    function syncExpandedPlayer() {
        const expandedPlayer = $('.expanded-player');
        if (!expandedPlayer) return;
        
        // Sync with mini player state
        const miniTitle = $('.player-track-title');
        const miniArtist = $('.player-track-artist');
        const miniImage = $('.player-track-image');
        const miniPlayBtn = $('.player-controls .play-btn i');
        
        const expTitle = $('.expanded-player-title', expandedPlayer);
        const expArtist = $('.expanded-player-artist', expandedPlayer);
        const expImage = $('.expanded-player-cover img', expandedPlayer);
        const expPlayBtn = $('.expanded-player-controls .play-btn i', expandedPlayer);
        
        if (miniTitle && expTitle) expTitle.textContent = miniTitle.textContent;
        if (miniArtist && expArtist) expArtist.textContent = miniArtist.textContent;
        if (miniImage && expImage) expImage.src = miniImage.src;
        if (miniPlayBtn && expPlayBtn) expPlayBtn.className = miniPlayBtn.className;
    }
    
    // Expose functions globally
    window.openBottomSheet = openBottomSheet;
    window.closeBottomSheet = closeBottomSheet;
    window.openExpandedPlayer = openExpandedPlayer;
    window.closeExpandedPlayer = closeExpandedPlayer;
    window.syncExpandedPlayer = syncExpandedPlayer;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
