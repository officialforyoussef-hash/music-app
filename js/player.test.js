/**
 * Property-Based Tests for Player Module
 * 
 * These tests validate correctness properties using randomized inputs.
 * Run in browser console or Node.js environment.
 * 
 * Validates: Requirements 5.3, 5.4, 5.5, 5.6
 */

// Import dependencies for Node.js testing
let playerModule, utilsModule;

if (typeof require !== 'undefined') {
    utilsModule = require('./utils.js');
    // Make clamp available globally for player.js
    global.clamp = utilsModule.clamp;
    global.formatTime = utilsModule.formatTime;
    global.$ = () => null; // Mock DOM selector
    playerModule = require('./player.js');
}

// Test configuration
const TEST_ITERATIONS = 100;
let testsPassed = 0;
let testsFailed = 0;

/**
 * Generate random number in range
 */
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate random integer in range
 */
function randomInt(min, max) {
    return Math.floor(randomInRange(min, max + 1));
}

/**
 * Generate random string
 */
function randomString(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate random track data
 */
function generateRandomTrack() {
    return {
        id: `track-${randomInt(1, 10000)}`,
        title: randomString(randomInt(3, 30)),
        artist: randomString(randomInt(3, 20)),
        image: `https://example.com/image${randomInt(1, 1000)}.jpg`,
        duration: randomInt(30, 600) // 30 seconds to 10 minutes
    };
}

/**
 * Reset player state to defaults
 */
function resetPlayerState() {
    const state = playerModule ? playerModule.playerState : playerState;
    state.isPlaying = false;
    state.currentTrack = null;
    state.currentTime = 0;
    state.duration = 0;
    state.volume = 0.7;
    state.isMuted = false;
    state.isShuffled = false;
    state.repeatMode = 'none';
}

/**
 * Run a property test with multiple iterations
 */
function runPropertyTest(name, property, iterations = TEST_ITERATIONS) {
    console.log(`\n🧪 Testing: ${name}`);
    
    for (let i = 0; i < iterations; i++) {
        try {
            const result = property();
            if (!result.passed) {
                testsFailed++;
                console.error(`❌ FAILED at iteration ${i + 1}`);
                console.error(`   Input: ${JSON.stringify(result.input)}`);
                console.error(`   Expected: ${result.expected}`);
                console.error(`   Actual: ${result.actual}`);
                return { passed: false, failingExample: result };
            }
        } catch (error) {
            testsFailed++;
            console.error(`❌ ERROR at iteration ${i + 1}: ${error.message}`);
            return { passed: false, failingExample: { error: error.message } };
        }
    }
    
    testsPassed++;
    console.log(`✅ PASSED (${iterations} iterations)`);
    return { passed: true };
}

// ============================================================================
// Property 1: Play Toggle Idempotence
// For any player state, calling togglePlay() twice should return the player 
// to its original isPlaying state.
// Validates: Requirements 5.4
// ============================================================================
function property1_PlayToggleIdempotence() {
    resetPlayerState();
    const state = playerModule ? playerModule.playerState : playerState;
    const toggle = playerModule ? playerModule.togglePlay : togglePlay;
    
    // Generate random initial state
    const initialIsPlaying = Math.random() > 0.5;
    state.isPlaying = initialIsPlaying;
    
    // Toggle twice
    toggle();
    toggle();
    
    // Should return to original state
    const finalIsPlaying = state.isPlaying;
    
    return {
        passed: finalIsPlaying === initialIsPlaying,
        input: { initialIsPlaying },
        expected: initialIsPlaying,
        actual: finalIsPlaying
    };
}

// ============================================================================
// Property 2: Progress Calculation Bounds
// For any click position on the progress bar (0-100%), the calculated 
// currentTime should always be between 0 and duration (inclusive).
// Validates: Requirements 5.5
// ============================================================================
function property2_ProgressCalculationBounds() {
    resetPlayerState();
    const state = playerModule ? playerModule.playerState : playerState;
    const setProgressFn = playerModule ? playerModule.setProgress : setProgress;
    
    // Generate random duration and percentage (including edge cases beyond 0-100)
    const duration = randomInRange(1, 1000);
    const percentage = randomInRange(-50, 150); // Test values outside normal range
    
    state.duration = duration;
    setProgressFn(percentage);
    
    const currentTime = state.currentTime;
    const isWithinBounds = currentTime >= 0 && currentTime <= duration;
    
    return {
        passed: isWithinBounds,
        input: { duration, percentage },
        expected: `0 <= currentTime <= ${duration}`,
        actual: currentTime
    };
}

// ============================================================================
// Property 3: Volume Level Bounds
// For any volume input value, the resulting volume level should always be 
// clamped between 0 and 1.
// Validates: Requirements 5.6
// ============================================================================
function property3_VolumeLevelBounds() {
    resetPlayerState();
    const state = playerModule ? playerModule.playerState : playerState;
    const setVolumeFn = playerModule ? playerModule.setVolume : setVolume;
    
    // Generate random volume input (including values outside 0-1 range)
    const inputVolume = randomInRange(-2, 3);
    
    setVolumeFn(inputVolume);
    
    const resultVolume = state.volume;
    const isWithinBounds = resultVolume >= 0 && resultVolume <= 1;
    
    return {
        passed: isWithinBounds,
        input: { inputVolume },
        expected: '0 <= volume <= 1',
        actual: resultVolume
    };
}

// ============================================================================
// Property 4: Track Loading Consistency
// For any card with valid track data, clicking its play button should result 
// in playerState.currentTrack containing that card's track data.
// Validates: Requirements 5.3
// ============================================================================
function property4_TrackLoadingConsistency() {
    resetPlayerState();
    const state = playerModule ? playerModule.playerState : playerState;
    const loadTrackFn = playerModule ? playerModule.loadTrack : loadTrack;
    
    // Generate random track data
    const trackData = generateRandomTrack();
    
    loadTrackFn(trackData);
    
    const loadedTrack = state.currentTrack;
    
    // Verify essential fields are preserved
    const titleMatches = loadedTrack && loadedTrack.title === trackData.title;
    const artistMatches = loadedTrack && loadedTrack.artist === trackData.artist;
    const idMatches = loadedTrack && loadedTrack.id === trackData.id;
    const imageMatches = loadedTrack && loadedTrack.image === trackData.image;
    
    const allMatch = titleMatches && artistMatches && idMatches && imageMatches;
    
    return {
        passed: allMatch,
        input: { trackData },
        expected: { id: trackData.id, title: trackData.title, artist: trackData.artist, image: trackData.image },
        actual: loadedTrack
    };
}

// ============================================================================
// Run All Property Tests
// ============================================================================
function runAllPropertyTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('       PROPERTY-BASED TESTS FOR PLAYER MODULE');
    console.log('       Feature: music-streaming-architecture');
    console.log('═══════════════════════════════════════════════════════════════');
    
    testsPassed = 0;
    testsFailed = 0;
    
    const results = {};
    
    // Property 1: Play Toggle Idempotence
    // Feature: music-streaming-architecture, Property 1: Play Toggle Idempotence
    results.property1 = runPropertyTest(
        'Property 1: Play Toggle Idempotence (Validates: Requirements 5.4)',
        property1_PlayToggleIdempotence
    );
    
    // Property 2: Progress Calculation Bounds
    // Feature: music-streaming-architecture, Property 2: Progress Calculation Bounds
    results.property2 = runPropertyTest(
        'Property 2: Progress Calculation Bounds (Validates: Requirements 5.5)',
        property2_ProgressCalculationBounds
    );
    
    // Property 3: Volume Level Bounds
    // Feature: music-streaming-architecture, Property 3: Volume Level Bounds
    results.property3 = runPropertyTest(
        'Property 3: Volume Level Bounds (Validates: Requirements 5.6)',
        property3_VolumeLevelBounds
    );
    
    // Property 4: Track Loading Consistency
    // Feature: music-streaming-architecture, Property 4: Track Loading Consistency
    results.property4 = runPropertyTest(
        'Property 4: Track Loading Consistency (Validates: Requirements 5.3)',
        property4_TrackLoadingConsistency
    );
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`       RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('═══════════════════════════════════════════════════════════════');
    
    return {
        passed: testsFailed === 0,
        results,
        summary: { passed: testsPassed, failed: testsFailed }
    };
}

// Auto-run tests if executed directly
if (typeof require !== 'undefined' && require.main === module) {
    const result = runAllPropertyTests();
    process.exit(result.passed ? 0 : 1);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllPropertyTests,
        property1_PlayToggleIdempotence,
        property2_ProgressCalculationBounds,
        property3_VolumeLevelBounds,
        property4_TrackLoadingConsistency
    };
}
