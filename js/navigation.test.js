/**
 * Property-Based Tests for Navigation Module
 * 
 * These tests validate correctness properties using randomized inputs.
 * Run in browser console or Node.js environment.
 * 
 * Validates: Requirements 2.4, 2.6
 */

// Import dependencies for Node.js testing
let navModule, utilsModule;

if (typeof require !== 'undefined') {
    utilsModule = require('./utils.js');
    // Make utils available globally for navigation.js
    global.$ = () => null;
    global.$$ = () => []; // querySelectorAll returns array-like
    global.on = () => {};
    global.debounce = utilsModule.debounce;
    navModule = require('./navigation.js');
}

// Test configuration
const TEST_ITERATIONS = 100;
let testsPassed = 0;
let testsFailed = 0;

/**
 * Generate random integer in range
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * List of valid page names that map to navigation items
 */
const VALID_PAGES = [
    'home',
    'discover',
    'trending',
    'playlists',
    'albums',
    'artists',
    'liked'
];

/**
 * Generate a random valid page name
 */
function generateRandomPage() {
    return VALID_PAGES[randomInt(0, VALID_PAGES.length - 1)];
}

/**
 * Reset navigation state to defaults
 */
function resetNavState() {
    const state = navModule ? navModule.navState : navState;
    state.currentPage = 'home';
    state.sidebarCollapsed = false;
    state.sidebarHidden = false;
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
// Property 5: Navigation State Consistency
// For any navigation action, the active nav item should match the current 
// page URL. When setActivePage is called with a page name, navState.currentPage
// should reflect that page name.
// Validates: Requirements 2.4, 2.6
// ============================================================================
function property5_NavigationStateConsistency() {
    resetNavState();
    const state = navModule ? navModule.navState : navState;
    const setActivePageFn = navModule ? navModule.setActivePage : setActivePage;
    
    // Generate random page name from valid pages
    const pageName = generateRandomPage();
    
    // Set the active page
    setActivePageFn(pageName);
    
    // Verify state matches the page we set
    const currentPage = state.currentPage;
    const stateMatchesPage = currentPage === pageName;
    
    return {
        passed: stateMatchesPage,
        input: { pageName },
        expected: pageName,
        actual: currentPage
    };
}

// ============================================================================
// Run All Property Tests
// ============================================================================
function runAllPropertyTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('       PROPERTY-BASED TESTS FOR NAVIGATION MODULE');
    console.log('       Feature: music-streaming-architecture');
    console.log('═══════════════════════════════════════════════════════════════');
    
    testsPassed = 0;
    testsFailed = 0;
    
    const results = {};
    
    // Property 5: Navigation State Consistency
    // Feature: music-streaming-architecture, Property 5: Navigation State Consistency
    results.property5 = runPropertyTest(
        'Property 5: Navigation State Consistency (Validates: Requirements 2.4, 2.6)',
        property5_NavigationStateConsistency
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
        property5_NavigationStateConsistency
    };
}
