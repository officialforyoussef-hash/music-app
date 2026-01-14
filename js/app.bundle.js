/**
 * Music Streaming App - Combined JavaScript
 * All modules merged into a single file
 */

// ============================================
// 1. PRELOADER (runs immediately)
// ============================================

window.addEventListener('load', function() {
    var preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(function() {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            document.body.classList.remove('loading');
            setTimeout(function() {
                preloader.remove();
            }, 400);
        }, 300);
    }
});

// ============================================
// 2. UTILITY FUNCTIONS
// ============================================

/**
 * Safe querySelector wrapper - returns single element
 */
function $(selector, context) {
    return (context || document).querySelector(selector);
}

/**
 * Safe querySelectorAll wrapper - returns NodeList
 */
function $$(selector, context) {
    return (context || document).querySelectorAll(selector);
}

/**
 * Safe addEventListener wrapper
 */
function on(element, event, handler, options) {
    if (element && typeof element.addEventListener === 'function') {
        element.addEventListener(event, handler, options || {});
    }
}

/**
 * Format seconds to mm:ss
 */
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

/**
 * Clamp a value between min and max
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function execution
 */
function debounce(func, wait) {
    var timeout;
    return function() {
        var args = arguments;
        var later = function() {
            clearTimeout(timeout);
            func.apply(null, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait || 100);
    };
}

// ============================================
// 3. PLAYER MODULE
// ============================================

var playerState = {
    isPlaying: false,
    currentTrack: null,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isShuffled: false,
    repeatMode: 'none'
};

var playerElements = {};

function togglePlay() {
    playerState.isPlaying = !playerState.isPlaying;
    updatePlayButton();
}

function setProgress(percentage) {
    var clamped = clamp(percentage, 0, 100);
    playerState.currentTime = (clamped / 100) * playerState.duration;
    updateProgressBar();
}

function setVolume(level) {
    playerState.volume = clamp(level, 0, 1);
    playerState.isMuted = playerState.volume === 0;
    updateVolumeUI();
}

function toggleMute() {
    playerState.isMuted = !playerState.isMuted;
    updateVolumeUI();
}

function loadTrack(trackData) {
    if (!trackData) return;
    
    playerState.currentTrack = {
        id: trackData.id || '',
        title: trackData.title || 'Unknown Track',
        artist: trackData.artist || 'Unknown Artist',
        image: trackData.image || ''
    };
    
    playerState.currentTime = 0;
    playerState.duration = trackData.duration || 210;
    playerState.isPlaying = true;
    
    updatePlayerUI();
}

function updatePlayerUI() {
    updateTrackInfo();
    updatePlayButton();
    updateProgressBar();
    updateTimeDisplay();
}

function updateTrackInfo() {
    if (!playerElements.trackTitle || !playerElements.trackArtist) return;
    
    var track = playerState.currentTrack;
    if (track) {
        playerElements.trackTitle.textContent = track.title;
        playerElements.trackArtist.textContent = track.artist;
        if (playerElements.trackImage && track.image) {
            playerElements.trackImage.src = track.image;
            playerElements.trackImage.alt = track.title + ' album cover';
        }
    } else {
        playerElements.trackTitle.textContent = 'No track playing';
        playerElements.trackArtist.textContent = 'Select a song to play';
    }
}

function updatePlayButton() {
    if (!playerElements.playBtn) return;
    
    var icon = playerElements.playBtn.querySelector('i');
    if (icon) {
        icon.className = playerState.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
    playerElements.playBtn.setAttribute('aria-label', playerState.isPlaying ? 'Pause' : 'Play');
}

function updateProgressBar() {
    if (!playerElements.progressFill || !playerElements.progressHandle) return;
    
    var percentage = playerState.duration > 0 
        ? (playerState.currentTime / playerState.duration) * 100 
        : 0;
    
    playerElements.progressFill.style.width = percentage + '%';
    playerElements.progressHandle.style.left = percentage + '%';
    
    if (playerElements.progressBar) {
        playerElements.progressBar.setAttribute('aria-valuenow', Math.round(percentage));
    }
}

function updateTimeDisplay() {
    if (!playerElements.timeDisplay) return;
    
    var times = playerElements.timeDisplay;
    if (times[0]) times[0].textContent = formatTime(playerState.currentTime);
    if (times[1]) times[1].textContent = formatTime(playerState.duration);
}

function updateVolumeUI() {
    if (!playerElements.volumeFill || !playerElements.volumeHandle) return;
    
    var displayVolume = playerState.isMuted ? 0 : playerState.volume * 100;
    
    playerElements.volumeFill.style.width = displayVolume + '%';
    playerElements.volumeHandle.style.left = displayVolume + '%';
    
    if (playerElements.volumeBtn) {
        var icon = playerElements.volumeBtn.querySelector('i');
        if (icon) {
            if (playerState.isMuted || playerState.volume === 0) {
                icon.className = 'fa-solid fa-volume-xmark';
            } else if (playerState.volume < 0.5) {
                icon.className = 'fa-solid fa-volume-low';
            } else {
                icon.className = 'fa-solid fa-volume-high';
            }
        }
    }
}

function toggleShuffle() {
    playerState.isShuffled = !playerState.isShuffled;
    if (playerElements.shuffleBtn) {
        playerElements.shuffleBtn.classList.toggle('active', playerState.isShuffled);
    }
}

function cycleRepeat() {
    var modes = ['none', 'all', 'one'];
    var currentIndex = modes.indexOf(playerState.repeatMode);
    playerState.repeatMode = modes[(currentIndex + 1) % modes.length];
    
    if (playerElements.repeatBtn) {
        playerElements.repeatBtn.classList.toggle('active', playerState.repeatMode !== 'none');
    }
}

function initPlayer() {
    var footer = $('footer');
    if (!footer) return;
    
    playerElements = {
        trackImage: $('.player-track-image', footer),
        trackTitle: $('.player-track-title', footer),
        trackArtist: $('.player-track-artist', footer),
        playBtn: $('.play-btn', footer),
        shuffleBtn: $('[aria-label="Shuffle"]', footer),
        repeatBtn: $('[aria-label="Repeat"]', footer),
        progressBar: $('.player-progress .progress-bar', footer),
        progressFill: $('.player-progress .progress-bar-fill', footer),
        progressHandle: $('.player-progress .progress-bar-handle', footer),
        timeDisplay: $$('.player-time', footer),
        volumeBtn: $('.volume-control .control-btn', footer),
        volumeBar: $('.volume-bar', footer),
        volumeFill: $('.volume-bar .progress-bar-fill', footer),
        volumeHandle: $('.volume-bar .progress-bar-handle', footer),
        likeBtn: $('.player-like-btn', footer)
    };
    
    updatePlayerUI();
    updateVolumeUI();
    setupProgressDrag();
    setupVolumeDrag();
}

function setupProgressDrag() {
    var bar = playerElements.progressBar;
    if (!bar) return;
    
    var isDragging = false;
    
    var updateProgress = function(e) {
        var rect = bar.getBoundingClientRect();
        var x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        var percentage = ((x - rect.left) / rect.width) * 100;
        setProgress(percentage);
    };
    
    bar.addEventListener('mousedown', function(e) {
        isDragging = true;
        bar.classList.add('dragging');
        updateProgress(e);
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        updateProgress(e);
    });
    
    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
        bar.classList.remove('dragging');
    });
    
    bar.addEventListener('touchstart', function(e) {
        isDragging = true;
        bar.classList.add('dragging');
        updateProgress(e);
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        updateProgress(e);
    }, { passive: true });
    
    document.addEventListener('touchend', function() {
        if (!isDragging) return;
        isDragging = false;
        bar.classList.remove('dragging');
    });
}

function setupVolumeDrag() {
    var bar = playerElements.volumeBar;
    if (!bar) return;
    
    var isDragging = false;
    
    var updateVolume = function(e) {
        var rect = bar.getBoundingClientRect();
        var x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        var level = (x - rect.left) / rect.width;
        setVolume(level);
    };
    
    bar.addEventListener('mousedown', function(e) {
        isDragging = true;
        bar.classList.add('dragging');
        updateVolume(e);
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        updateVolume(e);
    });
    
    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        isDragging = false;
        bar.classList.remove('dragging');
    });
}


// ============================================
// 4. NAVIGATION MODULE
// ============================================

var navState = {
    currentPage: 'home',
    sidebarCollapsed: false,
    sidebarHidden: false
};

var navElements = {};

function setActivePage(pageName) {
    if (!pageName) return;
    
    navState.currentPage = pageName;
    
    var navLinks = $$('.nav-link');
    navLinks.forEach(function(link) {
        var href = link.getAttribute('href') || '';
        var linkPage = href.replace('.html', '').replace('index', 'home');
        
        if (linkPage === pageName || (pageName === 'home' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function toggleSidebarCollapse() {
    navState.sidebarCollapsed = !navState.sidebarCollapsed;
    document.body.classList.toggle('sidebar-collapsed', navState.sidebarCollapsed);
}

function toggleSidebarVisibility() {
    var isCurrentlyVisible = document.body.classList.contains('sidebar-visible');
    navState.sidebarHidden = isCurrentlyVisible;
    document.body.classList.toggle('sidebar-visible', !isCurrentlyVisible);
}

function closeSidebar() {
    navState.sidebarHidden = true;
    document.body.classList.remove('sidebar-visible');
}

function handleResize() {
    var width = window.innerWidth;
    
    if (width > 1024) {
        navState.sidebarCollapsed = false;
        navState.sidebarHidden = false;
        document.body.classList.remove('sidebar-collapsed', 'sidebar-visible');
    } else if (width > 768) {
        navState.sidebarCollapsed = true;
        navState.sidebarHidden = false;
        document.body.classList.add('sidebar-collapsed');
        document.body.classList.remove('sidebar-visible');
    } else {
        navState.sidebarHidden = true;
        document.body.classList.remove('sidebar-collapsed');
    }
}

function detectCurrentPage() {
    var path = window.location.pathname;
    var filename = path.split('/').pop() || 'index.html';
    return filename.replace('.html', '').replace('index', 'home');
}

function initNavigation() {
    navElements = {
        sidebar: $('aside'),
        mobileMenuBtn: $('.mobile-menu-btn'),
        navLinks: $$('.nav-link')
    };
    
    var currentPage = detectCurrentPage();
    setActivePage(currentPage);
    handleResize();
    
    on(window, 'resize', debounce(handleResize, 150));
    
    on(window, 'spa:pageload', function() {
        var currentPage = detectCurrentPage();
        setActivePage(currentPage);
        handleResize();
    });
}

// ============================================
// 5. MAIN APPLICATION
// ============================================

(function() {
    'use strict';
    
    function init() {
        initNavigation();
        initPlayer();
        setupPlayerControls();
        setupCardInteractions();
        setupProfileDropdown();
        setupMobileMenu();
    }
    
    function setupPlayerControls() {
        var footer = $('footer');
        if (!footer) return;
        
        var playBtn = $('.play-btn', footer);
        on(playBtn, 'click', togglePlay);
        
        var shuffleBtn = $('[aria-label="Shuffle"]', footer);
        on(shuffleBtn, 'click', toggleShuffle);
        
        var repeatBtn = $('[aria-label="Repeat"]', footer);
        on(repeatBtn, 'click', cycleRepeat);
        
        var progressBar = $('.player-progress .progress-bar', footer);
        on(progressBar, 'click', handleProgressClick);
        
        var volumeBar = $('.volume-bar', footer);
        on(volumeBar, 'click', handleVolumeClick);
        
        var volumeBtn = $('.volume-control .control-btn', footer);
        on(volumeBtn, 'click', toggleMute);
        
        var likeBtn = $('.player-like-btn', footer);
        on(likeBtn, 'click', handleLikeClick);
    }
    
    function handleProgressClick(e) {
        var bar = e.currentTarget;
        var rect = bar.getBoundingClientRect();
        var percentage = ((e.clientX - rect.left) / rect.width) * 100;
        setProgress(percentage);
    }
    
    function handleVolumeClick(e) {
        var bar = e.currentTarget;
        var rect = bar.getBoundingClientRect();
        var level = (e.clientX - rect.left) / rect.width;
        setVolume(level);
    }
    
    function handleLikeClick(e) {
        var btn = e.currentTarget;
        var icon = btn.querySelector('i');
        
        if (icon) {
            var isLiked = icon.classList.contains('fa-solid');
            icon.className = isLiked ? 'fa-regular fa-heart' : 'fa-solid fa-heart';
            btn.classList.toggle('liked', !isLiked);
        }
    }
    
    function setupCardInteractions() {
        var main = $('main');
        if (!main) return;
        
        on(main, 'click', function(e) {
            var cardPlayBtn = e.target.closest('.card-play-btn');
            if (cardPlayBtn) {
                e.preventDefault();
                handleCardPlay(cardPlayBtn);
                return;
            }
            
            var trackPlayBtn = e.target.closest('.track-play');
            if (trackPlayBtn) {
                e.preventDefault();
                handleTrackRowPlay(trackPlayBtn);
                return;
            }
            
            var chartRow = e.target.closest('.chart-row');
            if (chartRow) {
                handleChartRowPlay(chartRow);
                return;
            }
            
            var trackRow = e.target.closest('.track-row');
            if (trackRow) {
                handleTrackRowPlay(trackRow.querySelector('.track-play') || trackRow);
                return;
            }
            
            var card = e.target.closest('.card');
            if (card) {
                handleCardClick(card);
            }
        });
    }
    
    function handleChartRowPlay(chartRow) {
        if (!chartRow) return;
        
        var trackData = {
            id: chartRow.dataset.id,
            title: chartRow.dataset.title,
            artist: chartRow.dataset.artist,
            image: chartRow.dataset.image
        };
        
        loadTrack(trackData);
    }
    
    function handleTrackRowPlay(element) {
        var trackRow = element.closest('.track-row');
        if (!trackRow) return;
        
        var trackData = {
            id: trackRow.dataset.id,
            title: trackRow.dataset.title,
            artist: trackRow.dataset.artist,
            image: trackRow.dataset.image
        };
        
        loadTrack(trackData);
    }
    
    function handleCardPlay(playBtn) {
        var card = playBtn.closest('.card');
        if (!card) return;
        
        var trackData = {
            id: card.dataset.id,
            title: card.dataset.title,
            artist: card.dataset.artist,
            image: card.dataset.image
        };
        
        loadTrack(trackData);
    }
    
    function handleCardClick(card) {
        var playBtn = card.querySelector('.card-play-btn');
        if (playBtn) {
            handleCardPlay(playBtn);
        }
    }
    
    function setupProfileDropdown() {
        var profileDropdown = $('.profile-dropdown');
        if (!profileDropdown) return;
        
        var profileBtn = $('.profile-btn', profileDropdown);
        var profileMenu = $('.profile-menu', profileDropdown);
        
        on(profileBtn, 'click', function(e) {
            e.stopPropagation();
            var isOpen = !profileMenu.hidden;
            
            profileMenu.hidden = isOpen;
            profileBtn.setAttribute('aria-expanded', !isOpen);
            profileDropdown.classList.toggle('open', !isOpen);
        });
        
        on(document, 'click', function(e) {
            if (!profileDropdown.contains(e.target)) {
                profileMenu.hidden = true;
                profileBtn.setAttribute('aria-expanded', 'false');
                profileDropdown.classList.remove('open');
            }
        });
        
        on(document, 'keydown', function(e) {
            if (e.key === 'Escape' && !profileMenu.hidden) {
                profileMenu.hidden = true;
                profileBtn.setAttribute('aria-expanded', 'false');
                profileDropdown.classList.remove('open');
                profileBtn.focus();
            }
        });
    }
    
    function setupMobileMenu() {
        var mobileMenuBtn = $('.mobile-menu-btn');
        if (!mobileMenuBtn) return;
        
        on(mobileMenuBtn, 'click', toggleSidebarVisibility);
        
        on(document, 'click', function(e) {
            if (window.innerWidth <= 768) {
                var sidebar = $('aside');
                var isClickOutside = !sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target);
                
                if (isClickOutside && document.body.classList.contains('sidebar-visible')) {
                    closeSidebar();
                }
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


// ============================================
// 6. MOBILE GESTURES MODULE
// ============================================

(function() {
    'use strict';
    
    if (window.innerWidth > 768) return;
    
    var mobileState = {
        expandedPlayer: false
    };
    
    function initMobile() {
        createPullToRefreshElement();
        createBottomSheetElement();
        createExpandedPlayerElement();
        setupPullToRefresh();
        setupCardSwipe();
        setupBottomSheet();
        setupExpandedPlayer();
    }
    
    function createPullToRefreshElement() {
        var ptr = document.createElement('div');
        ptr.className = 'pull-to-refresh';
        ptr.innerHTML = '<i class="fa-solid fa-arrow-rotate-right pull-to-refresh-icon"></i>';
        document.body.appendChild(ptr);
    }
    
    function setupPullToRefresh() {
        var main = $('main');
        var ptr = $('.pull-to-refresh');
        if (!main || !ptr) return;
        
        var startY = 0;
        var pulling = false;
        var isAtTop = false;
        
        on(main, 'touchstart', function(e) {
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
            
            var currentY = e.touches[0].clientY;
            var diff = currentY - startY;
            
            if (diff > 30 && main.scrollTop <= 0) {
                pulling = true;
                ptr.classList.add('visible');
                
                if (diff > 80) {
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
                
                setTimeout(function() {
                    ptr.classList.remove('refreshing', 'visible');
                }, 1500);
            } else {
                ptr.classList.remove('visible');
            }
        });
    }
    
    function createBottomSheetElement() {
        var overlay = document.createElement('div');
        overlay.className = 'bottom-sheet-overlay';
        
        var sheet = document.createElement('div');
        sheet.className = 'bottom-sheet';
        sheet.innerHTML = '<div class="bottom-sheet-handle"></div>' +
            '<div class="bottom-sheet-header">' +
            '<img class="bottom-sheet-image" src="" alt="">' +
            '<div class="bottom-sheet-info">' +
            '<div class="bottom-sheet-title"></div>' +
            '<div class="bottom-sheet-subtitle"></div>' +
            '</div></div>' +
            '<div class="bottom-sheet-content">' +
            '<button class="bottom-sheet-item" data-action="like"><i class="fa-regular fa-heart"></i><span>Like</span></button>' +
            '<button class="bottom-sheet-item" data-action="add-playlist"><i class="fa-solid fa-plus"></i><span>Add to Playlist</span></button>' +
            '<button class="bottom-sheet-item" data-action="queue"><i class="fa-solid fa-list"></i><span>Add to Queue</span></button>' +
            '<button class="bottom-sheet-item" data-action="share"><i class="fa-solid fa-share"></i><span>Share</span></button>' +
            '</div>';
        
        document.body.appendChild(overlay);
        document.body.appendChild(sheet);
    }
    
    function setupBottomSheet() {
        var overlay = $('.bottom-sheet-overlay');
        var sheet = $('.bottom-sheet');
        if (!overlay || !sheet) return;
        
        on(overlay, 'click', closeBottomSheet);
        
        on(sheet, 'click', function(e) {
            var item = e.target.closest('.bottom-sheet-item');
            if (item) {
                closeBottomSheet();
            }
        });
        
        var startY = 0;
        on(sheet, 'touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        on(sheet, 'touchend', function(e) {
            var endY = e.changedTouches[0].clientY;
            if (endY - startY > 100) {
                closeBottomSheet();
            }
        });
    }
    
    function openBottomSheet(trackData) {
        var overlay = $('.bottom-sheet-overlay');
        var sheet = $('.bottom-sheet');
        if (!overlay || !sheet) return;
        
        var img = $('.bottom-sheet-image', sheet);
        var title = $('.bottom-sheet-title', sheet);
        var subtitle = $('.bottom-sheet-subtitle', sheet);
        
        if (img) img.src = trackData.image || '';
        if (title) title.textContent = trackData.title || 'Unknown';
        if (subtitle) subtitle.textContent = trackData.artist || 'Unknown Artist';
        
        overlay.classList.add('visible');
        sheet.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
    
    function closeBottomSheet() {
        var overlay = $('.bottom-sheet-overlay');
        var sheet = $('.bottom-sheet');
        if (!overlay || !sheet) return;
        
        overlay.classList.remove('visible');
        sheet.classList.remove('visible');
        document.body.style.overflow = '';
    }
    
    function setupCardSwipe() {
        var main = $('main');
        if (!main) return;
        
        var pressTimer = null;
        
        on(main, 'touchstart', function(e) {
            var card = e.target.closest('.card');
            if (!card) return;
            
            pressTimer = setTimeout(function() {
                var trackData = {
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
    
    function createExpandedPlayerElement() {
        var player = document.createElement('div');
        player.className = 'expanded-player';
        player.innerHTML = '<div class="expanded-player-header">' +
            '<button class="expanded-player-close" aria-label="Close"><i class="fa-solid fa-chevron-down"></i></button>' +
            '<div class="expanded-player-source">Playing from Playlist</div>' +
            '<button class="expanded-player-more" aria-label="More options"><i class="fa-solid fa-ellipsis"></i></button>' +
            '</div>' +
            '<div class="expanded-player-cover"><img src="" alt="Album cover"></div>' +
            '<div class="expanded-player-info">' +
            '<div class="expanded-player-title">No track playing</div>' +
            '<div class="expanded-player-artist">Select a song</div>' +
            '</div>' +
            '<div class="expanded-player-progress">' +
            '<div class="progress-bar" role="slider" aria-label="Track progress">' +
            '<div class="progress-bar-fill" style="width: 0%;"></div>' +
            '<div class="progress-bar-handle" style="left: 0%;"></div>' +
            '</div>' +
            '<div class="expanded-player-times"><span>0:00</span><span>0:00</span></div>' +
            '</div>' +
            '<div class="expanded-player-controls">' +
            '<button class="control-btn" aria-label="Shuffle"><i class="fa-solid fa-shuffle"></i></button>' +
            '<button class="control-btn" aria-label="Previous"><i class="fa-solid fa-backward-step"></i></button>' +
            '<button class="play-btn" aria-label="Play"><i class="fa-solid fa-play"></i></button>' +
            '<button class="control-btn" aria-label="Next"><i class="fa-solid fa-forward-step"></i></button>' +
            '<button class="control-btn" aria-label="Repeat"><i class="fa-solid fa-repeat"></i></button>' +
            '</div>' +
            '<div class="expanded-player-actions">' +
            '<button class="control-btn" aria-label="Like"><i class="fa-regular fa-heart"></i></button>' +
            '<button class="control-btn" aria-label="Share"><i class="fa-solid fa-share"></i></button>' +
            '<button class="control-btn" aria-label="Queue"><i class="fa-solid fa-list"></i></button>' +
            '</div>';
        
        document.body.appendChild(player);
    }
    
    function setupExpandedPlayer() {
        var footer = $('footer');
        var expandedPlayer = $('.expanded-player');
        if (!footer || !expandedPlayer) return;
        
        on(footer, 'click', function(e) {
            if (e.target.closest('button')) return;
            openExpandedPlayer();
        });
        
        var closeBtn = $('.expanded-player-close', expandedPlayer);
        on(closeBtn, 'click', closeExpandedPlayer);
        
        var playBtn = $('.expanded-player-controls .play-btn', expandedPlayer);
        on(playBtn, 'click', function() {
            togglePlay();
            syncExpandedPlayer();
        });
        
        var startY = 0;
        on(expandedPlayer, 'touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        on(expandedPlayer, 'touchend', function(e) {
            var endY = e.changedTouches[0].clientY;
            if (endY - startY > 150) {
                closeExpandedPlayer();
            }
        });
    }
    
    function openExpandedPlayer() {
        var expandedPlayer = $('.expanded-player');
        if (!expandedPlayer) return;
        
        syncExpandedPlayer();
        expandedPlayer.classList.add('visible');
        document.body.style.overflow = 'hidden';
        mobileState.expandedPlayer = true;
    }
    
    function closeExpandedPlayer() {
        var expandedPlayer = $('.expanded-player');
        if (!expandedPlayer) return;
        
        expandedPlayer.classList.remove('visible');
        document.body.style.overflow = '';
        mobileState.expandedPlayer = false;
    }
    
    function syncExpandedPlayer() {
        var expandedPlayer = $('.expanded-player');
        if (!expandedPlayer) return;
        
        var miniTitle = $('.player-track-title');
        var miniArtist = $('.player-track-artist');
        var miniImage = $('.player-track-image');
        var miniPlayBtn = $('.player-controls .play-btn i');
        
        var expTitle = $('.expanded-player-title', expandedPlayer);
        var expArtist = $('.expanded-player-artist', expandedPlayer);
        var expImage = $('.expanded-player-cover img', expandedPlayer);
        var expPlayBtn = $('.expanded-player-controls .play-btn i', expandedPlayer);
        
        if (miniTitle && expTitle) expTitle.textContent = miniTitle.textContent;
        if (miniArtist && expArtist) expArtist.textContent = miniArtist.textContent;
        if (miniImage && expImage) expImage.src = miniImage.src;
        if (miniPlayBtn && expPlayBtn) expPlayBtn.className = miniPlayBtn.className;
    }
    
    window.openBottomSheet = openBottomSheet;
    window.closeBottomSheet = closeBottomSheet;
    window.openExpandedPlayer = openExpandedPlayer;
    window.closeExpandedPlayer = closeExpandedPlayer;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobile);
    } else {
        initMobile();
    }
})();


// ============================================
// 7. SPA NAVIGATION MODULE
// ============================================

(function() {
    'use strict';
    
    var pageCache = new Map();
    var loadedStyles = new Set();
    
    function extractContent(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        
        return {
            main: doc.querySelector('main') ? doc.querySelector('main').innerHTML : '',
            title: doc.querySelector('title') ? doc.querySelector('title').textContent : 'Music App'
        };
    }
    
    function navigateTo(url) {
        var main = document.querySelector('main');
        if (!main) return;
        
        main.style.opacity = '0.5';
        main.style.pointerEvents = 'none';
        
        var doNavigate = function(html) {
            var content = extractContent(html);
            
            main.style.transition = 'opacity 0.15s ease';
            main.style.opacity = '0';
            
            setTimeout(function() {
                main.innerHTML = content.main;
                document.title = content.title;
                
                history.pushState({ url: url }, content.title, url);
                updateActiveNav(url);
                
                main.style.opacity = '1';
                main.style.pointerEvents = '';
                main.scrollTop = 0;
                
                window.dispatchEvent(new CustomEvent('spa:pageload'));
            }, 150);
        };
        
        if (pageCache.has(url)) {
            doNavigate(pageCache.get(url));
        } else {
            fetch(url)
                .then(function(response) { return response.text(); })
                .then(function(html) {
                    pageCache.set(url, html);
                    doNavigate(html);
                })
                .catch(function() {
                    window.location.href = url;
                });
        }
    }
    
    function updateActiveNav(url) {
        var filename = url.split('/').pop() || 'index.html';
        var navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(function(link) {
            var href = link.getAttribute('href') || '';
            var isActive = href === filename || 
                          (filename === 'index.html' && href === 'index.html') ||
                          (filename === '' && href === 'index.html');
            
            link.classList.toggle('active', isActive);
        });
    }
    
    function handleLinkClick(e) {
        var link = e.target.closest('a');
        if (!link) return;
        
        var href = link.getAttribute('href');
        
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
    
    function handlePopState(e) {
        if (e.state && e.state.url) {
            navigateTo(e.state.url);
        } else {
            navigateTo(window.location.pathname.split('/').pop() || 'index.html');
        }
    }
    
    function preloadPage(url) {
        if (pageCache.has(url)) return;
        
        fetch(url)
            .then(function(response) { return response.text(); })
            .then(function(html) { pageCache.set(url, html); })
            .catch(function() {});
    }
    
    function initSPA() {
        document.addEventListener('click', handleLinkClick);
        window.addEventListener('popstate', handlePopState);
        
        history.replaceState(
            { url: window.location.pathname.split('/').pop() || 'index.html' },
            document.title,
            window.location.href
        );
        
        setTimeout(function() {
            var navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(function(link) {
                var href = link.getAttribute('href');
                if (href && href.endsWith('.html')) {
                    preloadPage(href);
                }
            });
        }, 2000);
    }
    
    window.SPA = {
        navigateTo: navigateTo,
        preloadPage: preloadPage
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSPA);
    } else {
        initSPA();
    }
})();
