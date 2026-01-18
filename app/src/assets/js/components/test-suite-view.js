/**
 * TestSuiteView Template-Based Component
 * End-to-end test suite for Astrodex
 *
 * CONVERTED FROM WEB COMPONENT TO TEMPLATE-BASED APPROACH
 * Reason: Web Components with Shadow DOM prevent Tailwind CSS from working
 */

// State management for this view
let viewState = {
    container: null,
    testModules: null
};

/**
 * Create and render the test suite view
 * @param {HTMLElement} container - Container element to render into
 * @returns {Object} API for interacting with the view
 */
export function createTestSuiteView(container) {
    viewState.container = container;
    viewState.testModules = null;

    // Render the template
    render();

    // Load modules and attach event listeners
    loadModules();
    attachEventListeners();

    // Return API for external interaction
    return {
        destroy: () => {
            viewState.container = null;
            viewState.testModules = null;
        }
    };
}

/**
 * Render the main template
 */
function render() {
    if (!viewState.container) return;

    viewState.container.innerHTML = `
        <style>
            .result-item.pass { border-color: #4ade80; background: rgba(74, 222, 128, 0.1); }
            .result-item.fail { border-color: #f87171; background: rgba(248, 113, 113, 0.1); }
        </style>

        <div class="p-8 max-w-5xl mx-auto h-full overflow-auto bg-gray-900 text-gray-200">
            <span class="inline-block mb-4 text-blue-400 cursor-pointer hover:underline" id="backLink">← Back to Chart</span>

            <h1 class="text-2xl font-bold text-white mb-6">End-to-End Test Suite - Astrodex</h1>

            <div class="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
                <h2 class="text-lg font-semibold text-blue-400 mb-2">Test 1: Chart Data Persistence</h2>
                <p class="text-gray-400 mb-2">Tests localStorage save/load functionality</p>
                <button id="test1Btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Test</button>
                <div id="test1-results" class="mt-2"></div>
            </div>

            <div class="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
                <h2 class="text-lg font-semibold text-blue-400 mb-2">Test 2: Calculation Functions</h2>
                <p class="text-gray-400 mb-1">Tests astronomical calculation functions with known data</p>
                <p class="text-gray-400 mb-1"><strong class="text-gray-300">Test Data:</strong> 12/28/1989 11:36pm, Orange, CA</p>
                <p class="text-gray-400 mb-2"><strong class="text-gray-300">Expected:</strong> Sun in Capricorn, Moon in Capricorn, Mercury in Capricorn</p>
                <button id="test2Btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Test</button>
                <div id="test2-results" class="mt-2"></div>
            </div>

            <div class="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
                <h2 class="text-lg font-semibold text-blue-400 mb-2">Test 3: Module Imports</h2>
                <p class="text-gray-400 mb-2">Tests that all modules are available</p>
                <button id="test3Btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Test</button>
                <div id="test3-results" class="mt-2"></div>
            </div>

            <div class="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
                <h2 class="text-lg font-semibold text-blue-400 mb-2">Test 4: View Manager</h2>
                <p class="text-gray-400 mb-2">Tests view switching functionality</p>
                <button id="test4Btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Test</button>
                <div id="test4-results" class="mt-2"></div>
            </div>

            <div class="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
                <h2 class="text-lg font-semibold text-blue-400 mb-2">Test 5: UI Helpers</h2>
                <p class="text-gray-400 mb-2">Tests loading indicators and toast notifications</p>
                <button id="test5Btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Run Test</button>
                <div id="test5-results" class="mt-2"></div>
            </div>
        </div>
    `;
}

/**
 * Load required modules asynchronously
 */
async function loadModules() {
    try {
        const [geocodingModule, astroModule] = await Promise.all([
            import('../geocoding-service.js'),
            import('../astro-calculations.js')
        ]);

        viewState.testModules = {
            GeocodingService: geocodingModule.GeocodingService,
            calculatePlanetaryPositions: astroModule.calculatePlanetaryPositions,
            calculatePlanetaryMotion: astroModule.calculatePlanetaryMotion,
            calculateSect: astroModule.calculateSect,
            longitudeToSign: astroModule.longitudeToSign,
            checkCombustion: astroModule.checkCombustion,
            calculateAllAspects: astroModule.calculateAllAspects,
            calculateOverallTestimony: astroModule.calculateOverallTestimony,
            calculateSectBeneficMalefic: astroModule.calculateSectBeneficMalefic
        };

        console.log('Test modules loaded:', viewState.testModules);
    } catch (error) {
        console.error('Error loading test modules:', error);
    }
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
    if (!viewState.container) return;

    // Back link
    const backLink = viewState.container.querySelector('#backLink');
    if (backLink) {
        backLink.addEventListener('click', () => {
            viewState.container.dispatchEvent(new CustomEvent('view-change', {
                bubbles: true,
                detail: { view: 'chart' }
            }));
        });
    }

    // Test buttons
    const test1Btn = viewState.container.querySelector('#test1Btn');
    const test2Btn = viewState.container.querySelector('#test2Btn');
    const test3Btn = viewState.container.querySelector('#test3Btn');
    const test4Btn = viewState.container.querySelector('#test4Btn');
    const test5Btn = viewState.container.querySelector('#test5Btn');

    if (test1Btn) test1Btn.addEventListener('click', () => testChartDataPersistence());
    if (test2Btn) test2Btn.addEventListener('click', () => testCalculationFunctions());
    if (test3Btn) test3Btn.addEventListener('click', () => testModuleImports());
    if (test4Btn) test4Btn.addEventListener('click', () => testViewManager());
    if (test5Btn) test5Btn.addEventListener('click', () => testUIHelpers());
}

/**
 * Log a test result
 */
function logResult(testId, message, passed) {
    if (!viewState.container) return;

    const resultsDiv = viewState.container.querySelector(`#${testId}-results`);
    if (!resultsDiv) return;

    const resultItem = document.createElement('div');
    resultItem.className = `p-2 my-1 border-l-4 ${passed ? 'border-green-400 bg-green-900/20 text-green-400' : 'border-red-400 bg-red-900/20 text-red-400'} font-semibold`;
    resultItem.textContent = `${passed ? '✓' : '✗'} ${message}`;
    resultsDiv.appendChild(resultItem);
}

/**
 * Test 1: Chart Data Persistence
 */
function testChartDataPersistence() {
    if (!viewState.container) return;

    const resultsDiv = viewState.container.querySelector('#test1-results');
    if (resultsDiv) resultsDiv.innerHTML = '';

    try {
        const testData = {
            name: 'Test User',
            date: '1989-12-28',
            time: '23:36',
            location: 'Orange, CA'
        };

        localStorage.setItem('astrodex_chart_data', JSON.stringify(testData));
        logResult('test1', 'Data saved to localStorage', true);

        const loaded = JSON.parse(localStorage.getItem('astrodex_chart_data'));
        const matches = loaded.name === testData.name &&
                       loaded.date === testData.date &&
                       loaded.time === testData.time &&
                       loaded.location === testData.location;

        logResult('test1', 'Data loaded from localStorage', matches);
        logResult('test1', `Loaded data: ${JSON.stringify(loaded)}`, matches);

        localStorage.removeItem('astrodex_chart_data');
        logResult('test1', 'Cleanup completed', true);

    } catch (error) {
        logResult('test1', `Error: ${error.message}`, false);
    }
}

/**
 * Test 2: Calculation Functions
 */
async function testCalculationFunctions() {
    if (!viewState.container) return;

    const resultsDiv = viewState.container.querySelector('#test2-results');
    if (resultsDiv) resultsDiv.innerHTML = '';

    try {
        if (!viewState.testModules) {
            logResult('test2', 'Modules not loaded yet - please wait and retry', false);
            return;
        }

        const { calculatePlanetaryPositions, longitudeToSign } = viewState.testModules;

        const testDate = new Date('1989-12-28T23:36:00');
        const latitude = 33.7879;
        const longitude = -117.8531;

        logResult('test2', 'Starting calculations...', true);

        const positions = calculatePlanetaryPositions(testDate, latitude, longitude);
        logResult('test2', 'Planetary positions calculated', true);

        const sunSign = longitudeToSign(positions.Sun.longitude);
        const sunInCapricorn = sunSign.sign === 'Capricorn';
        logResult('test2', `Sun: ${sunSign.formattedPosition}`, sunInCapricorn);

        const moonSign = longitudeToSign(positions.Moon.longitude);
        const moonInCapricorn = moonSign.sign === 'Capricorn';
        logResult('test2', `Moon: ${moonSign.formattedPosition}`, moonInCapricorn);

        const mercurySign = longitudeToSign(positions.Mercury.longitude);
        const mercuryInCapricorn = mercurySign.sign === 'Capricorn';
        logResult('test2', `Mercury: ${mercurySign.formattedPosition}`, mercuryInCapricorn);

        const allPassed = sunInCapricorn && moonInCapricorn && mercuryInCapricorn;
        logResult('test2', `All planets in expected signs: ${allPassed ? 'PASS' : 'FAIL'}`, allPassed);

    } catch (error) {
        logResult('test2', `Error: ${error.message}`, false);
        console.error('Test 2 error:', error);
    }
}

/**
 * Test 3: Module Imports
 */
function testModuleImports() {
    if (!viewState.container) return;

    const resultsDiv = viewState.container.querySelector('#test3-results');
    if (resultsDiv) resultsDiv.innerHTML = '';

    const modules = [
        'GeocodingService',
        'calculatePlanetaryPositions',
        'calculatePlanetaryMotion',
        'calculateSect',
        'longitudeToSign',
        'checkCombustion',
        'calculateAllAspects',
        'calculateOverallTestimony',
        'calculateSectBeneficMalefic'
    ];

    modules.forEach(moduleName => {
        const available = viewState.testModules && viewState.testModules[moduleName];
        logResult('test3', `${moduleName}: ${available ? 'Available' : 'Missing'}`, available);
    });
}

/**
 * Test 4: View Manager
 */
function testViewManager() {
    if (!viewState.container) return;

    const resultsDiv = viewState.container.querySelector('#test4-results');
    if (resultsDiv) resultsDiv.innerHTML = '';

    // ViewManager should be available on window
    const vm = window.ViewManager;
    const vmAvailable = typeof vm !== 'undefined';
    logResult('test4', 'ViewManager available', vmAvailable);

    if (vmAvailable) {
        logResult('test4', 'ViewManager.loadView method exists', typeof vm.loadView === 'function');
        logResult('test4', `Current view: ${vm.currentView}`, true);
    } else {
        logResult('test4', 'ViewManager not loaded', false);
    }
}

/**
 * Test 5: UI Helpers
 */
function testUIHelpers() {
    if (!viewState.container) return;

    const resultsDiv = viewState.container.querySelector('#test5-results');
    if (resultsDiv) resultsDiv.innerHTML = '';

    const functions = ['showLoadingSpinner', 'hideLoadingSpinner', 'showProgressBar', 'showToast'];

    functions.forEach(funcName => {
        const available = typeof window[funcName] === 'function';
        logResult('test5', `${funcName}: ${available ? 'Available' : 'Missing'}`, available);
    });

    if (typeof window.showToast === 'function') {
        window.showToast('Test notification', 'info');
        logResult('test5', 'Toast notification triggered', true);
    }
}
