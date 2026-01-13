/**
 * Player Module
 * Handles music player state and controls
 */

// Player State
const playerState = {
    isPlaying: false,
    currentTrack: null,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isShuffled: false,
    repeatMode: 'none' // 'none', 'all', 'one'
};

// DOM Elements (cached on init)
let playerElements = {};

/**
 * Toggle play/pause state
 */
function togglePlay() {
    playerState.isPlaying = !playerState.isPlaying;
    updatePlayButton();
}

/**
 * Set progress percentage
 * @param {number} percentage - Progress percentage (0-100)
 */
function setProgress(percentage) {
    const clamped = clamp(percentage, 0, 100);
    playerState.currentTime = (clamped / 100) * playerState.duration;
    updateProgressBar();
}

/**
 * Set volume level
 * @param {number} level - Volume level (0-1)
 */
function setVolume(level) {
    playerState.volume = clamp(level, 0, 1);
    playerState.isMuted = playerState.volume === 0;
    updateVolumeUI();
}

/**
 * Toggle mute state
 */
function toggleMute() {
    playerState.isMuted = !playerState.isMuted;
    updateVolumeUI();
}

/**
 * Load track data into player
 * @param {Object} trackData - Track information
 */
function loadTrack(trackData) {
    if (!trackData) return;
    
    playerState.currentTrack = {
        id: trackData.id || '',
        title: trackData.title || 'Unknown Track',
        artist: trackData.artist || 'Unknown Artist',
        image: trackData.image || ''
    };
    
    // Reset playback state
    playerState.currentTime = 0;
    playerState.duration = trackData.duration || 210; // Default 3:30
    playerState.isPlaying = true;
    
    updatePlayerUI();
}

/**
 * Update all player UI elements
 */
function updatePlayerUI() {
    updateTrackInfo();
    updatePlayButton();
    updateProgressBar();
    updateTimeDisplay();
}

/**
 * Update track info display
 */
function updateTrackInfo() {
    if (!playerElements.trackTitle || !playerElements.trackArtist) return;
    
    const track = playerState.currentTrack;
    if (track) {
        playerElements.trackTitle.textContent = track.title;
        playerElements.trackArtist.textContent = track.artist;
        if (playerElements.trackImage && track.image) {
            playerElements.trackImage.src = track.image;
            playerElements.trackImage.alt = `${track.title} album cover`;
        }
    } else {
        playerElements.trackTitle.textContent = 'No track playing';
        playerElements.trackArtist.textContent = 'Select a song to play';
    }
}

/**
 * Update play/pause button icon
 */
function updatePlayButton() {
    if (!playerElements.playBtn) return;
    
    const icon = playerElements.playBtn.querySelector('i');
    if (icon) {
        icon.className = playerState.isPlaying 
            ? 'fa-solid fa-pause' 
            : 'fa-solid fa-play';
    }
    playerElements.playBtn.setAttribute('aria-label', 
        playerState.isPlaying ? 'Pause' : 'Play');
}

/**
 * Update progress bar position
 */
function updateProgressBar() {
    if (!playerElements.progressFill || !playerElements.progressHandle) return;
    
    const percentage = playerState.duration > 0 
        ? (playerState.currentTime / playerState.duration) * 100 
        : 0;
    
    playerElements.progressFill.style.width = `${percentage}%`;
    playerElements.progressHandle.style.left = `${percentage}%`;
    
    if (playerElements.progressBar) {
        playerElements.progressBar.setAttribute('aria-valuenow', Math.round(percentage));
    }
}

/**
 * Update time display
 */
function updateTimeDisplay() {
    if (!playerElements.timeDisplay) return;
    
    const times = playerElements.timeDisplay;
    if (times[0]) times[0].textContent = formatTime(playerState.currentTime);
    if (times[1]) times[1].textContent = formatTime(playerState.duration);
}

/**
 * Update volume UI
 */
function updateVolumeUI() {
    if (!playerElements.volumeFill || !playerElements.volumeHandle) return;
    
    const displayVolume = playerState.isMuted ? 0 : playerState.volume * 100;
    
    playerElements.volumeFill.style.width = `${displayVolume}%`;
    playerElements.volumeHandle.style.left = `${displayVolume}%`;
    
    // Update volume icon
    if (playerElements.volumeBtn) {
        const icon = playerElements.volumeBtn.querySelector('i');
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

/**
 * Toggle shuffle mode
 */
function toggleShuffle() {
    playerState.isShuffled = !playerState.isShuffled;
    
    if (playerElements.shuffleBtn) {
        playerElements.shuffleBtn.classList.toggle('active', playerState.isShuffled);
    }
}

/**
 * Cycle repeat mode
 */
function cycleRepeat() {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(playerState.repeatMode);
    playerState.repeatMode = modes[(currentIndex + 1) % modes.length];
    
    if (playerElements.repeatBtn) {
        const icon = playerElements.repeatBtn.querySelector('i');
        playerElements.repeatBtn.classList.toggle('active', playerState.repeatMode !== 'none');
        
        if (icon && playerState.repeatMode === 'one') {
            icon.className = 'fa-solid fa-repeat fa-1';
        } else if (icon) {
            icon.className = 'fa-solid fa-repeat';
        }
    }
}

/**
 * Initialize player module
 */
function initPlayer() {
    // Cache DOM elements
    const footer = $('footer');
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
    
    // Set initial UI state
    updatePlayerUI();
    updateVolumeUI();
    
    // Setup drag handlers
    setupProgressDrag();
    setupVolumeDrag();
}

/**
 * Setup drag functionality for progress bar
 */
function setupProgressDrag() {
    const bar = playerElements.progressBar;
    if (!bar) return;
    
    let isDragging = false;
    
    const updateProgress = (e) => {
        const rect = bar.getBoundingClientRect();
        const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const percentage = ((x - rect.left) / rect.width) * 100;
        setProgress(percentage);
    };
    
    const startDrag = (e) => {
        isDragging = true;
        bar.classList.add('dragging');
        updateProgress(e);
    };
    
    const onDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        updateProgress(e);
    };
    
    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        bar.classList.remove('dragging');
    };
    
    // Mouse events
    bar.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    
    // Touch events
    bar.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);
}

/**
 * Setup drag functionality for volume bar
 */
function setupVolumeDrag() {
    const bar = playerElements.volumeBar;
    if (!bar) return;
    
    let isDragging = false;
    
    const updateVolume = (e) => {
        const rect = bar.getBoundingClientRect();
        const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const level = (x - rect.left) / rect.width;
        setVolume(level);
    };
    
    const startDrag = (e) => {
        isDragging = true;
        bar.classList.add('dragging');
        updateVolume(e);
    };
    
    const onDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        updateVolume(e);
    };
    
    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        bar.classList.remove('dragging');
    };
    
    // Mouse events
    bar.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    
    // Touch events
    bar.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        playerState,
        togglePlay,
        setProgress,
        setVolume,
        toggleMute,
        loadTrack,
        updatePlayerUI,
        initPlayer
    };
}
